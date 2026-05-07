import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";
import os from "os";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { readdir, stat, readFile, writeFile, statfs, mkdir, rename as renameFile, access as fsAccess } from "fs/promises";
import { createReadStream } from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import chokidar from "chokidar";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

dotenv.config();

const execAsync = promisify(exec);
const { Pool } = pg;

// ─── Gemini AI ──────────────────────────────────────────────────────────────
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// ─── CPU Load Sampling ──────────────────────────────────────────────────────
let cpuLoadCache = 0;
let gpuLoadCache = -1;
let lastCpuInfo = os.cpus().map((c) => ({ ...c.times }));

function startCpuSampling() {
  setInterval(() => {
    const current = os.cpus();
    const deltas = current.map((cpu, i) => {
      const prev = lastCpuInfo[i];
      const idle = cpu.times.idle - prev.idle;
      const total =
        Object.values(cpu.times).reduce((a, b) => a + b, 0) -
        Object.values(prev).reduce((a, b) => a + b, 0);
      return total === 0 ? 0 : (1 - idle / total) * 100;
    });
    cpuLoadCache = Math.round(
      deltas.reduce((a, b) => a + b, 0) / deltas.length
    );
    lastCpuInfo = current.map((c) => ({ ...c.times }));
  }, 2000);
}

async function pollGpu() {
  try {
    const { stdout } = await execAsync(
      "nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits"
    );
    gpuLoadCache = parseInt(stdout.trim(), 10);
  } catch {
    gpuLoadCache = -1;
  }
  setTimeout(pollGpu, 2000);
}

// ─── ROM Helpers ─────────────────────────────────────────────────────────────
const ROM_EXT = new Set([
  ".nes", ".sfc", ".smc", ".z64", ".n64", ".v64",
  ".gba", ".gbc", ".gb", ".nds", ".3ds",
  ".iso", ".bin", ".cue", ".img", ".mdf",
  ".rom", ".zip", ".7z", ".chd",
  ".smd", ".md",  ".gen", ".gg",  ".sms",
  ".pce", ".lnx", ".ws",  ".wsc",
  ".ngp", ".ngc", ".a26", ".a78",
  ".pbp", ".cso",
]);

const EXT_PLATFORM: Record<string, string> = {
  ".nes": "nes",  ".sfc": "snes",  ".smc": "snes",
  ".z64": "n64",  ".n64": "n64",   ".v64": "n64",
  ".gba": "gba",  ".gbc": "gbc",   ".gb":  "gb",
  ".nds": "nds",  ".3ds": "3ds",
  ".bin": "ps1",  ".cue": "ps1",
  ".iso": "ps2",  ".mdf": "ps2",   ".img": "ps2",   ".chd": "ps2",
  ".pbp": "psp",  ".cso": "psp",
  ".smd": "genesis", ".md": "genesis", ".gen": "genesis",
  ".gg":  "gamegear",  ".sms": "mastersystem",
  ".pce": "pce",  ".lnx": "lynx",
  ".ws":  "wonderswan", ".wsc": "wonderswan",
  ".ngp": "neogeo",    ".ngc": "neogeo",
  ".a26": "atari2600",  ".a78": "atari7800",
};

// Platform → RetroArch core + optional standalone emulator
export const PLATFORM_CORES: Record<string, { coreId: string; coreName: string; standalone?: string }> = {
  nes:          { coreId: "fceumm",              coreName: "FCEUmm" },
  snes:         { coreId: "snes9x",              coreName: "Snes9x" },
  n64:          { coreId: "mupen64plus_next",    coreName: "Mupen64Plus-Next" },
  gba:          { coreId: "mgba",               coreName: "mGBA" },
  gbc:          { coreId: "mgba",               coreName: "mGBA" },
  gb:           { coreId: "mgba",               coreName: "mGBA" },
  nds:          { coreId: "desmume",            coreName: "DeSmuME" },
  "3ds":        { coreId: "citra",              coreName: "Citra" },
  ps1:          { coreId: "pcsx_rearmed",       coreName: "PCSX-ReARMed", standalone: "duckstation" },
  ps2:          { coreId: "pcsx2",              coreName: "PCSX2",        standalone: "pcsx2" },
  psp:          { coreId: "ppsspp",             coreName: "PPSSPP" },
  mame:         { coreId: "mame",               coreName: "MAME" },
  genesis:      { coreId: "genesis_plus_gx",    coreName: "Genesis Plus GX" },
  megadrive:    { coreId: "genesis_plus_gx",    coreName: "Genesis Plus GX" },
  gamegear:     { coreId: "genesis_plus_gx",    coreName: "Genesis Plus GX" },
  mastersystem: { coreId: "genesis_plus_gx",    coreName: "Genesis Plus GX" },
  sega32x:      { coreId: "picodrive",          coreName: "PicoDrive" },
  dreamcast:    { coreId: "flycast",            coreName: "Flycast" },
  saturn:       { coreId: "yabause",            coreName: "Yabause",      standalone: "mednafen" },
  pce:          { coreId: "mednafen_pce",       coreName: "Beetle PCE" },
  wonderswan:   { coreId: "mednafen_wswan",     coreName: "Beetle WonderSwan" },
  neogeo:       { coreId: "fbneo",              coreName: "FinalBurn Neo" },
  atari2600:    { coreId: "stella",             coreName: "Stella" },
  atari7800:    { coreId: "prosystem",          coreName: "ProSystem" },
  lynx:         { coreId: "mednafen_lynx",      coreName: "Beetle Lynx" },
  unknown:      { coreId: "detect",             coreName: "Auto-Detect" },
};

function detectPlatform(filename: string): string {
  return EXT_PLATFORM[path.extname(filename).toLowerCase()] ?? "unknown";
}

async function hashFileMd5(filePath: string): Promise<string> {
  const hash = crypto.createHash("md5");
  hash.update(await readFile(filePath));
  return hash.digest("hex").toUpperCase();
}

// ─── Art Infrastructure ──────────────────────────────────────────────────────
const ART_DIR = path.join(process.cwd(), "data", "art");

// Libretro thumbnail system name map
const LIBRETRO_SYSTEMS: Record<string, string> = {
  nes:          "Nintendo - Nintendo Entertainment System",
  snes:         "Nintendo - Super Nintendo Entertainment System",
  n64:          "Nintendo - Nintendo 64",
  gba:          "Nintendo - Game Boy Advance",
  gbc:          "Nintendo - Game Boy Color",
  gb:           "Nintendo - Game Boy",
  nds:          "Nintendo - Nintendo DS",
  "3ds":        "Nintendo - Nintendo 3DS",
  ps1:          "Sony - PlayStation",
  ps2:          "Sony - PlayStation 2",
  psp:          "Sony - PlayStation Portable",
  genesis:      "Sega - Mega Drive - Genesis",
  megadrive:    "Sega - Mega Drive - Genesis",
  gamegear:     "Sega - Game Gear",
  mastersystem: "Sega - Master System - Mark III",
  dreamcast:    "Sega - Dreamcast",
  saturn:       "Sega - Saturn",
  pce:          "NEC - PC Engine - TurboGrafx 16",
  neogeo:       "SNK - Neo Geo CD",
  mame:         "MAME",
  atari2600:    "Atari - 2600",
  atari7800:    "Atari - 7800",
  wonderswan:   "Bandai - WonderSwan Color",
  lynx:         "Atari - Lynx",
};

// LaunchBox platform name → Nexus platform key
const LB_PLATFORM_MAP: Record<string, string> = {
  "Sony Playstation 2": "ps2",  "Sony PlayStation 2": "ps2",
  "Sony Playstation":   "ps1",  "Sony PlayStation":   "ps1",
  "Sony PSP":           "psp",  "Sony PlayStation Portable": "psp",
  "Nintendo Entertainment System": "nes",  "NES": "nes",
  "Super Nintendo Entertainment System": "snes",  "SNES": "snes",
  "Nintendo 64":        "n64",
  "Nintendo Game Boy Advance": "gba",
  "Nintendo Game Boy Color":   "gbc",
  "Nintendo Game Boy":  "gb",
  "Nintendo DS":        "nds",
  "Nintendo 3DS":       "3ds",
  "Sega Genesis":       "genesis",  "Sega Mega Drive": "megadrive",
  "Sega Game Gear":     "gamegear",
  "Sega Master System": "mastersystem",  "Sega Master System - Mark III": "mastersystem",
  "Sega Dreamcast":     "dreamcast",
  "Sega Saturn":        "saturn",
  "MAME":               "mame",
  "Arcade":             "mame",
  "Atari 2600":         "atari2600",
  "Atari 7800":         "atari7800",
  "Bandai WonderSwan Color": "wonderswan",
  "Atari Lynx":         "lynx",
};

function lbPlatformToNexus(lb: string): string {
  return LB_PLATFORM_MAP[lb] ?? "unknown";
}

function cleanTitleForLibretro(title: string): string {
  return title
    .replace(/&/g, "_")
    .replace(/\//g, "_")
    .replace(/: /g, " - ")
    .replace(/:/g, "_")
    .trim();
}

async function ensureArtDir() {
  await mkdir(ART_DIR, { recursive: true }).catch(() => {});
}

/** Download boxart from libretro thumbnails repo. Returns local serve URL or null. */
async function fetchAndSaveArt(gameId: string, title: string, platform: string): Promise<string | null> {
  const system = LIBRETRO_SYSTEMS[platform];
  if (!system) return null;
  await ensureArtDir();

  // Already on disk? Return immediately
  for (const ext of [".png", ".jpg", ".jpeg"]) {
    try { await fsAccess(path.join(ART_DIR, gameId + ext)); return `/api/art/${gameId}`; } catch { /* continue */ }
  }

  const tryDownload = async (t: string): Promise<string | null> => {
    const clean = cleanTitleForLibretro(t);
    const url = `https://thumbnails.libretro.com/${encodeURIComponent(system)}/Named_Boxarts/${encodeURIComponent(clean)}.png`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) return null;
      const buf = await r.arrayBuffer();
      if (buf.byteLength < 500) return null; // not a real image
      const dest = path.join(ART_DIR, `${gameId}.png`);
      await writeFile(dest, Buffer.from(buf));
      return `/api/art/${gameId}`;
    } catch { return null; }
  };

  // Try full title first, then short title (before first colon/dash)
  const result = await tryDownload(title);
  if (result) return result;
  const shortTitle = title.split(/ [-:] /)[0].trim();
  if (shortTitle !== title) return tryDownload(shortTitle);
  return null;
}

/** Find LaunchBox box-front art for a game title */
async function findLbArt(artRoot: string, title: string): Promise<string | null> {
  const subfolders = ["Box - Front", "Box - Front - Reconstructed", "Fanart - Box - Front", "Clear Logo"];
  for (const sub of subfolders) {
    for (const ext of [".png", ".jpg", ".jpeg"]) {
      const p = path.join(artRoot, sub, title + ext);
      try { await fsAccess(p); return p; } catch { /* next */ }
    }
  }
  return null;
}

async function scanVaultDir(root: string) {
  const results: { filename: string; fullPath: string; relativePath: string; size: number }[] = [];
  async function walk(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory() && !e.name.startsWith(".")) {
          await walk(full);
        } else if (e.isFile() && ROM_EXT.has(path.extname(e.name).toLowerCase())) {
          const s = await stat(full);
          results.push({
            filename: e.name,
            fullPath: full,
            relativePath: "./" + path.relative(root, full).replace(/\\/g, "/"),
            size: s.size,
          });
        }
      }
    } catch { /* skip unreadable */ }
  }
  await walk(root);
  return results;
}

// ─── DB Mapper ───────────────────────────────────────────────────────────────
function rowToGame(row: Record<string, any>) {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    boxArt: row.box_art ?? "",
    heroImage: row.hero_image ?? "",
    playtime: row.playtime ?? 0,
    lastPlayed: row.last_played
      ? new Date(row.last_played).toISOString()
      : new Date(0).toISOString(),
    syncStatus: row.sync_status ?? "synced",
    dominantColor: row.dominant_color ?? "#1a1a2e",
    relativePath: row.relative_path ?? "",
    metadata: {
      description: row.description ?? "",
      developer: row.developer ?? "",
      publisher: row.publisher ?? "",
      releaseDate: row.release_date ?? "",
      genre: row.genre ?? [],
      players: row.players ?? "1",
      rating: row.rating ?? 0,
    },
  };
}

// ─── DB Schema ───────────────────────────────────────────────────────────────
const DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS vault_config (
    id INT PRIMARY KEY DEFAULT 1,
    root_path   TEXT NOT NULL DEFAULT '',
    vault_id    TEXT NOT NULL DEFAULT 'NV-9412-PRB',
    bios_path   TEXT NOT NULL DEFAULT '',
    emulator_path TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
  );
  INSERT INTO vault_config (id) VALUES (1) ON CONFLICT DO NOTHING;

  CREATE TABLE IF NOT EXISTS games (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    platform      TEXT NOT NULL DEFAULT 'unknown',
    relative_path TEXT,
    box_art       TEXT DEFAULT '',
    hero_image    TEXT DEFAULT '',
    playtime      INT  DEFAULT 0,
    last_played   TIMESTAMPTZ,
    sync_status   TEXT DEFAULT 'synced',
    dominant_color TEXT DEFAULT '#1a1a2e',
    description   TEXT DEFAULT '',
    developer     TEXT DEFAULT '',
    publisher     TEXT DEFAULT '',
    release_date  TEXT DEFAULT '',
    genre         TEXT[] DEFAULT '{}',
    players       TEXT DEFAULT '1',
    rating        INT  DEFAULT 0,
    file_hash     TEXT DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    game_ids    TEXT[] DEFAULT '{}',
    is_portable BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS daemon_logs (
    id         SERIAL PRIMARY KEY,
    level      TEXT NOT NULL,
    message    TEXT NOT NULL,
    source     TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT UNIQUE NOT NULL,
    display_name  TEXT,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    last_seen     TIMESTAMPTZ DEFAULT NOW()
  );
`;

// ─── Password Helpers (PBKDF2 — no extra packages) ─────────────────────────
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  try {
    const attempt = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'));
  } catch { return false; }
}

// ─── RetroArch auto-detect candidate paths ────────────────────────────────────
const RETROARCH_CANDIDATES = [
  process.env.EMULATOR_PATH,
  'C:\\RetroArch\\retroarch.exe',
  'C:\\RetroArch-Win64\\retroarch.exe',
  'C:\\LaunchBox\\Emulators\\RetroArch\\retroarch.exe',
  'C:\\LaunchBox\\ThirdParty\\RetroArch\\retroarch.exe',
  path.join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'RetroArch', 'retroarch.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)', 'RetroArch', 'retroarch.exe'),
  path.join(process.env.LOCALAPPDATA ?? '', 'RetroArch', 'retroarch.exe'),
].filter(Boolean) as string[];

// ─── Main Server ─────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  // Gzip all responses — reduces JS/CSS/JSON by 60-70% over the wire
  app.use(compression({ level: 6, threshold: 512 }));
  app.use(express.json({ limit: "10mb" }));
  const PORT = parseInt(process.env.PORT ?? "3000", 10);

  // ── Database ──────────────────────────────────────────────────
  let pool: pg.Pool | null = null;
  let dbConnected = false;

  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    try {
      const client = await pool.connect();
      await client.query(DB_SCHEMA);
      // Seed vault_config with env defaults on first run
      await client.query(
        `UPDATE vault_config SET
           root_path    = CASE WHEN root_path    = '' THEN $1 ELSE root_path    END,
           bios_path    = CASE WHEN bios_path    = '' THEN $2 ELSE bios_path    END,
           emulator_path = CASE WHEN emulator_path = '' THEN $3 ELSE emulator_path END
         WHERE id = 1`,
        [
          process.env.VAULT_ROOT ?? "",
          process.env.BIOS_PATH ?? "",
          process.env.EMULATOR_PATH ?? "",
        ]
      );
      client.release();
      dbConnected = true;
      console.log("[NEXUS] ✓ Neon PostgreSQL schema ready");
    } catch (err) {
      console.error("[NEXUS] DB init error:", err);
    }
  } else {
    console.warn("[NEXUS] ⚠ DATABASE_URL not set — running in memory-only mode");
  }

  // In-memory fallback
  const mem = {
    vaultConfig: {
      root_path: process.env.VAULT_ROOT ?? "",
      bios_path: process.env.BIOS_PATH ?? "",
      emulator_path: process.env.EMULATOR_PATH ?? "",
      vault_id: "NV-9412-PRB",
    },
    games: [] as ReturnType<typeof rowToGame>[],
    logs: [] as { level: string; message: string; source: string; created_at: string }[],
  };

  // ── SSE Daemon Log Broadcast ──────────────────────────────────
  const sseClients = new Set<express.Response>();

  function log(level: string, message: string, source = "system") {
    const entry = { level, message, source, created_at: new Date().toISOString() };
    mem.logs = [...mem.logs.slice(-100), entry];
    const data = `data: ${JSON.stringify(entry)}\n\n`;
    sseClients.forEach((c) => { try { c.write(data); } catch { sseClients.delete(c); } });
    if (dbConnected && pool) {
      pool
        .query("INSERT INTO daemon_logs (level, message, source) VALUES ($1,$2,$3)", [
          level, message, source,
        ])
        .catch(() => {});
    }
    console.log(`[${level}][${source}] ${message}`);
  }

  // ── Vault Config Helper ───────────────────────────────────────
  async function getVaultConfig() {
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT * FROM vault_config WHERE id = 1");
        return r.rows[0] ?? mem.vaultConfig;
      } catch { /* fall through */ }
    }
    return mem.vaultConfig;
  }

  // ── Auth ──────────────────────────────────────────────────────
  const JWT_SECRET = process.env.JWT_SECRET ?? crypto.randomBytes(32).toString("hex");
  const ACCESS_PIN = process.env.ACCESS_PIN ?? "";

  // ── Ghost Scanner (chokidar OS-level file watcher) ────────────
  let fileWatcher: ReturnType<typeof chokidar.watch> | null = null;
  let watcherRoot = "";
  const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

  async function autoSortRom(filePath: string, vaultRoot: string): Promise<string> {
    const platform = detectPlatform(path.basename(filePath));
    if (platform === "unknown") return filePath;
    const platformDir = path.join(vaultRoot, platform.toUpperCase());
    await mkdir(platformDir, { recursive: true });
    const dest = path.join(platformDir, path.basename(filePath));
    if (filePath === dest) return filePath;
    try { await fsAccess(dest); return filePath; } catch { /* dest free, safe to move */ }
    await renameFile(filePath, dest);
    log("INFO", `Auto-sorted \u2192 ${platform.toUpperCase()}/${path.basename(filePath)}`, "watcher");
    return dest;
  }

  async function processNewRom(filePath: string, vaultRoot: string) {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    if (!ROM_EXT.has(ext)) return;

    log("INFO", `Ghost Scanner detected: ${filename}`, "watcher");

    // Auto-sort into platform subfolder
    let finalPath = filePath;
    if (process.env.AUTO_SORT !== "false") {
      try { finalPath = await autoSortRom(filePath, vaultRoot); } catch (e) {
        log("WARN", `Auto-sort skipped: ${e}`, "watcher");
      }
    }

    const relativePath = "./" + path.relative(vaultRoot, finalPath).replace(/\\/g, "/");
    const gameId = crypto.createHash("md5").update(relativePath).digest("hex");

    // Skip if already in library
    if (dbConnected && pool) {
      try {
        const { rowCount } = await pool.query("SELECT id FROM games WHERE id=$1", [gameId]);
        if (rowCount && rowCount > 0) return;
      } catch { /* fall through */ }
    } else if (mem.games.find((g) => g.id === gameId)) {
      return;
    }

    const platform = detectPlatform(filename);
    const core = PLATFORM_CORES[platform] ?? PLATFORM_CORES.unknown;
    const cleanTitle = path.basename(filename, ext)
      .replace(/[_()\[\]]/g, " ").replace(/[_\-\.]+/g, " ").trim()
      .replace(/\s+/g, " ");

    const game: Record<string, any> = {
      id: gameId, title: cleanTitle, platform, core_id: core.coreId,
      relative_path: relativePath, box_art: "", hero_image: "",
      playtime: 0, sync_status: "pending", dominant_color: "#1a1a2e",
      description: "", developer: "", publisher: "", release_date: "",
      genre: [], players: "1", rating: 0, file_hash: "",
    };

    // Gemini AI metadata enrichment
    if (ai) {
      try {
        const aiResult = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Nexus Emu Metadata Scraper. ROM filename: "${filename}". Return ONLY valid JSON with these exact keys: title (string), developer (string), publisher (string), release_date (string YYYY-MM-DD or ""), genre (string array), players (string e.g. "1" or "1-2"), rating (integer 0-100), description (one concise sentence), dominant_color (hex #rrggbb matching the game's mood/era).`,
          config: { responseMimeType: "application/json" },
        });
        const meta = JSON.parse(aiResult.text.trim());
        Object.assign(game, meta);
        log("INFO", `AI enriched: "${game.title}" [${platform.toUpperCase()}]`, "ai");
      } catch { /* metadata enrichment optional */ }
    }

    if (dbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO games (id,title,platform,relative_path,box_art,hero_image,playtime,sync_status,dominant_color,description,developer,publisher,release_date,genre,players,rating)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           ON CONFLICT (id) DO UPDATE SET relative_path=EXCLUDED.relative_path, updated_at=NOW()`,
          [game.id, game.title, game.platform, game.relative_path, game.box_art, game.hero_image,
           game.playtime, game.sync_status, game.dominant_color, game.description, game.developer,
           game.publisher, game.release_date, game.genre, game.players, game.rating]
        );
      } catch (e) { log("ERROR", `DB insert: ${e}`, "database"); }
    } else {
      mem.games.push(rowToGame(game));
    }

    // Broadcast typed SSE event — frontend intercepts this
    const payload = JSON.stringify({ type: "new-rom-detected", game: rowToGame(game) });
    sseClients.forEach((c) => { try { c.write(`data: ${payload}\n\n`); } catch { sseClients.delete(c); } });
    log("INFO", `\u2728 New title added: "${game.title}" [${platform.toUpperCase()}] \u2192 ${core.coreName}`, "watcher");

    // Fire-and-forget art fetch
    if (!game.box_art) {
      fetchAndSaveArt(gameId, String(game.title), platform).then(async (artUrl) => {
        if (!artUrl) return;
        if (dbConnected && pool) {
          await pool.query("UPDATE games SET box_art=$1, updated_at=NOW() WHERE id=$2", [artUrl, gameId]).catch(() => {});
        } else {
          const g = mem.games.find((g) => g.id === gameId);
          if (g) (g as any).boxArt = artUrl;
        }
        log("INFO", `\uD83C\uDFA8 Art fetched: "${game.title}"`, "art");
      }).catch(() => {});
    }
  }

  async function startVaultWatcher(vaultRoot: string) {
    if (fileWatcher) {
      try { await fileWatcher.close(); } catch { /* ok */ }
      fileWatcher = null;
      watcherRoot = "";
    }
    if (!vaultRoot) return;
    try { await fsAccess(vaultRoot); } catch {
      log("WARN", `Ghost Scanner: vault root not accessible \u2014 ${vaultRoot}`, "watcher");
      return;
    }
    watcherRoot = vaultRoot;
    fileWatcher = chokidar.watch(vaultRoot, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
      ignored: /(^|[/\\])\.|nexus-vault\.json$/,
      depth: 6,
    });
    fileWatcher.on("add", (filePath: string) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!ROM_EXT.has(ext)) return;
      const prev = debounceMap.get(filePath);
      if (prev) clearTimeout(prev);
      debounceMap.set(filePath, setTimeout(() => {
        debounceMap.delete(filePath);
        processNewRom(filePath, vaultRoot).catch((err) =>
          log("ERROR", `Ghost Scanner error: ${err}`, "watcher")
        );
      }, 2000));
    });
    fileWatcher.on("error", (err: Error) =>
      log("ERROR", `Watcher: ${err.message}`, "watcher")
    );
    log("INFO", `Ghost Scanner activated \u2014 watching ${vaultRoot}`, "watcher");
  }

  // ─────────────────────────────────────────────────────────────
  // API ROUTES
  // ─────────────────────────────────────────────────────────────

  // ── Health ───────────────────────────────────────────────────
  app.get("/api/health", async (_req, res) => {
    let dbTimestamp: string | null = null;
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT NOW()");
        dbTimestamp = r.rows[0].now;
      } catch { dbConnected = false; }
    }
    res.json({
      status: "ok",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: dbTimestamp ?? new Date().toISOString(),
      version: "2.0.4",
    });
  });

  // ── System Stats ─────────────────────────────────────────────
  app.get("/api/system/stats", async (_req, res) => {
    const memTotal = os.totalmem();
    const memFree = os.freemem();
    let diskTotal = 0, diskFree = 0;
    try {
      const fs = await statfs(process.cwd());
      diskTotal = fs.blocks * fs.bsize;
      diskFree  = fs.bfree  * fs.bsize;
    } catch { /* statfs not available */ }

    res.json({
      cpu: { load: cpuLoadCache, cores: os.cpus().length, model: os.cpus()[0]?.model ?? "Unknown" },
      gpu: { load: gpuLoadCache, model: "RTX 3060 Ti", available: gpuLoadCache >= 0 },
      memory: {
        total: memTotal, free: memFree, used: memTotal - memFree,
        usedPercent: Math.round(((memTotal - memFree) / memTotal) * 100),
      },
      disk: {
        total: diskTotal, free: diskFree, used: diskTotal - diskFree,
        usedPercent: diskTotal > 0 ? Math.round(((diskTotal - diskFree) / diskTotal) * 100) : 0,
      },
      platform: os.platform(),
      uptime: os.uptime(),
    });
  });

  // ── Daemon SSE Stream ─────────────────────────────────────────
  app.get("/api/daemon/stream", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
  });

  app.get("/api/daemon/logs", async (_req, res) => {
    if (dbConnected && pool) {
      try {
        const r = await pool.query(
          "SELECT * FROM daemon_logs ORDER BY created_at DESC LIMIT 100"
        );
        return res.json(r.rows.reverse());
      } catch { /* fall through */ }
    }
    res.json(mem.logs.slice(-100));
  });

  // ── Games ─────────────────────────────────────────────────────
  app.get("/api/games", async (_req, res) => {
    // Short cache: service worker / browser can skip this request if fresh
    res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    if (dbConnected && pool) {
      try {
        const r = await pool.query(
          "SELECT * FROM games ORDER BY last_played DESC NULLS LAST, title ASC"
        );
        return res.json(r.rows.map(rowToGame));
      } catch (err) {
        log("ERROR", `Games fetch failed: ${err}`, "database");
      }
    }
    res.json(mem.games);
  });

  app.delete("/api/games/:id", async (req, res) => {
    const { id } = req.params;
    if (dbConnected && pool) {
      try { await pool.query("DELETE FROM games WHERE id=$1", [id]); } catch { /* ok */ }
    }
    mem.games = mem.games.filter((g) => g.id !== id);
    log("INFO", `Game removed: ${id}`, "library");
    res.json({ success: true });
  });

  app.patch("/api/games/:id/playtime", async (req, res) => {
    const { id } = req.params;
    const { minutes } = req.body as { minutes: number };
    if (dbConnected && pool) {
      try {
        await pool.query(
          "UPDATE games SET playtime = playtime + $1, last_played = NOW(), updated_at = NOW() WHERE id=$2",
          [minutes, id]
        );
        return res.json({ success: true });
      } catch { /* fall through */ }
    }
    const g = mem.games.find((g) => g.id === id);
    if (g) { g.playtime += minutes; g.lastPlayed = new Date().toISOString(); }
    res.json({ success: true });
  });

  // ── Native Folder / File Picker (Windows PowerShell dialog) ──
  app.get("/api/system/pick-folder", async (req, res) => {
    const description = (req.query.description as string | undefined) ?? "Select a folder";
    try {
      const script = [
        "Add-Type -AssemblyName System.Windows.Forms;",
        "$d = New-Object System.Windows.Forms.FolderBrowserDialog;",
        `$d.Description = '${description.replace(/'/g, "")}';`,
        "$d.ShowNewFolderButton = $true;",
        "$app = New-Object System.Windows.Forms.Form;",
        "$app.TopMost = $true;",
        "if ($d.ShowDialog($app) -eq 'OK') { $d.SelectedPath } else { '' }",
      ].join(" ");
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${script}"`, { timeout: 60_000 });
      const picked = stdout.trim();
      if (picked) res.json({ path: picked });
      else res.json({ path: null, cancelled: true });
    } catch (err) {
      log("ERROR", `pick-folder failed: ${err}`, "system");
      res.status(500).json({ error: "Could not open folder dialog" });
    }
  });

  app.get("/api/system/pick-file", async (req, res) => {
    const filter = (req.query.filter as string | undefined) ?? "Executable files|*.exe|All files|*.*";
    const title  = (req.query.title as string | undefined) ?? "Select a file";
    try {
      const script = [
        "Add-Type -AssemblyName System.Windows.Forms;",
        "$f = New-Object System.Windows.Forms.OpenFileDialog;",
        `$f.Title = '${title.replace(/'/g, "")}';`,
        `$f.Filter = '${filter.replace(/'/g, "")}';`,
        "$f.Multiselect = $false;",
        "$app = New-Object System.Windows.Forms.Form;",
        "$app.TopMost = $true;",
        "if ($f.ShowDialog($app) -eq 'OK') { $f.FileName } else { '' }",
      ].join(" ");
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${script}"`, { timeout: 60_000 });
      const picked = stdout.trim();
      if (picked) res.json({ path: picked });
      else res.json({ path: null, cancelled: true });
    } catch (err) {
      log("ERROR", `pick-file failed: ${err}`, "system");
      res.status(500).json({ error: "Could not open file dialog" });
    }
  });

  // ── Vault ─────────────────────────────────────────────────────
  app.get("/api/vault/config", async (_req, res) => {
    res.json(await getVaultConfig());
  });

  app.post("/api/vault/config", async (req, res) => {
    const { root_path, bios_path, emulator_path } = req.body as Record<string, string>;
    if (dbConnected && pool) {
      try {
        await pool.query(
          `UPDATE vault_config SET
             root_path     = COALESCE($1, root_path),
             bios_path     = COALESCE($2, bios_path),
             emulator_path = COALESCE($3, emulator_path),
             updated_at    = NOW()
           WHERE id = 1`,
          [root_path ?? null, bios_path ?? null, emulator_path ?? null]
        );
      } catch { /* fall through */ }
    }
    if (root_path)      mem.vaultConfig.root_path      = root_path;
    if (bios_path)      mem.vaultConfig.bios_path      = bios_path;
    if (emulator_path)  mem.vaultConfig.emulator_path  = emulator_path;
    log("INFO", `Vault config updated: root=${root_path ?? "(unchanged)"}`, "vault");
    // Restart Ghost Scanner if vault root changed
    if (root_path) startVaultWatcher(root_path).catch(() => {});
    res.json({ success: true });
  });

  app.post("/api/vault/scan", async (req, res) => {
    const config = await getVaultConfig();
    const vaultRoot: string = (req.body as any).root_path ?? config.root_path;

    if (!vaultRoot) {
      return res.status(400).json({ error: "Vault root path not configured. Set VAULT_ROOT in .env or use the Vault Manager." });
    }
    try { await stat(vaultRoot); } catch {
      return res.status(400).json({ error: `Directory not found: ${vaultRoot}` });
    }

    log("INFO", `Vault scan started: ${vaultRoot}`, "scanner");
    try {
      const roms = await scanVaultDir(vaultRoot);
      log("INFO", `Discovered ${roms.length} ROM file(s)`, "scanner");

      const added: ReturnType<typeof rowToGame>[] = [];

      for (const rom of roms) {
        const gameId = crypto.createHash("md5").update(rom.relativePath).digest("hex");
        const platform = detectPlatform(rom.filename);
        const cleanTitle = path.basename(rom.filename, path.extname(rom.filename))
          .replace(/[_()\[\]]/g, " ").replace(/[_\-\.]+/g, " ").trim()
          .replace(/\s+/g, " ");

        // Skip if already in DB
        if (dbConnected && pool) {
          try {
            const exists = await pool.query("SELECT id FROM games WHERE id=$1", [gameId]);
            if (exists.rowCount && exists.rowCount > 0) continue;
          } catch { /* fall through */ }
        } else if (mem.games.find((g) => g.id === gameId)) {
          continue;
        }

        const game: Record<string, any> = {
          id: gameId,
          title: cleanTitle,
          platform,
          core_id: (PLATFORM_CORES[platform] ?? PLATFORM_CORES.unknown).coreId,
          relative_path: rom.relativePath,
          box_art: "",
          hero_image: "",
          playtime: 0,
          sync_status: "synced",
          dominant_color: "#1a1a2e",
          description: "",
          developer: "",
          publisher: "",
          release_date: "",
          genre: [],
          players: "1",
          rating: 0,
          file_hash: "",
        };

        // AI metadata scrape
        if (ai) {
          try {
            log("INFO", `[AI] Scraping: ${rom.filename}`, "scanner");
            const result = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: `You are the Nexus Emu Metadata Scraper. Given this ROM filename: "${rom.filename}", return ONLY a valid JSON object with keys: title (string), developer (string), publisher (string), release_date (string YYYY-MM-DD or empty), genre (array of strings), players (string e.g. "1-2"), rating (integer 0-100), description (one concise sentence), dominant_color (hex color #rrggbb that fits the game's mood).`,
              config: { responseMimeType: "application/json" },
            });
            Object.assign(game, JSON.parse(result.text.trim()));
          } catch (e) {
            log("WARN", `AI scrape failed for ${rom.filename}`, "scanner");
          }
        }

        if (dbConnected && pool) {
          try {
            await pool.query(
              `INSERT INTO games
                 (id,title,platform,relative_path,box_art,hero_image,playtime,sync_status,dominant_color,
                  description,developer,publisher,release_date,genre,players,rating)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
               ON CONFLICT (id) DO UPDATE SET relative_path=EXCLUDED.relative_path, updated_at=NOW()`,
              [
                game.id, game.title, game.platform, game.relative_path,
                game.box_art, game.hero_image, game.playtime, game.sync_status,
                game.dominant_color, game.description, game.developer, game.publisher,
                game.release_date, game.genre, game.players, game.rating,
              ]
            );
          } catch (e) {
            log("ERROR", `DB insert failed for ${game.title}: ${e}`, "database");
          }
        } else {
          mem.games.push(rowToGame(game));
        }
        added.push(rowToGame(game));

        // Async art fetch — don't block the scan
        fetchAndSaveArt(game.id, game.title, game.platform).then(async (artUrl) => {
          if (!artUrl) return;
          if (dbConnected && pool) {
            await pool.query("UPDATE games SET box_art=$1, updated_at=NOW() WHERE id=$2", [artUrl, game.id]).catch(() => {});
          } else {
            const g = mem.games.find((g) => g.id === game.id);
            if (g) (g as any).boxArt = artUrl;
          }
        }).catch(() => {});
      }

      // Write manifest
      const manifest = {
        vault_id: config.vault_id ?? "NV-9412-PRB",
        root_path: vaultRoot,
        scanned_at: new Date().toISOString(),
        games: roms.map((r) => ({
          id: crypto.createHash("md5").update(r.relativePath).digest("hex"),
          relative_path: r.relativePath,
          filename: r.filename,
        })),
      };
      try {
        await writeFile(
          path.join(vaultRoot, "nexus-vault.json"),
          JSON.stringify(manifest, null, 2)
        );
        log("INFO", "nexus-vault.json manifest written", "vault");
      } catch { /* read-only drive */ }

      log("INFO", `Scan complete — ${added.length} new title(s) added`, "scanner");
      res.json({ scanned: roms.length, added: added.length, games: added });
    } catch (err) {
      log("ERROR", `Vault scan error: ${err}`, "scanner");
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/vault/heal", async (req, res) => {
    const { new_root_path } = req.body as { new_root_path: string };
    if (!new_root_path) return res.status(400).json({ error: "new_root_path required" });

    log("INFO", `Healing vault paths → ${new_root_path}`, "vault");
    if (dbConnected && pool) {
      try {
        await pool.query("UPDATE vault_config SET root_path=$1, updated_at=NOW() WHERE id=1", [
          new_root_path,
        ]);
      } catch { /* fall through */ }
    }
    mem.vaultConfig.root_path = new_root_path;
    log("INFO", "Path healing complete. All relative links resolved.", "vault");
    res.json({ success: true, new_root_path });
  });

  // ── BIOS Verification ─────────────────────────────────────────
  // Well-known BIOS MD5 hashes (partial list; extend as needed)
  const KNOWN_BIOS: Record<string, { name: string; md5: string }> = {
    "scph5501.bin":  { name: "PS1 BIOS v3.0 (USA)",     md5: "490F666E1AFB15B7362B406ED1CEA246" },
    "scph1001.bin":  { name: "PS1 BIOS v2.2 (USA)",     md5: "37157331EAEDAFD47E4B9FBB79F21CE1" },
    "scph70012.bin": { name: "PS2 BIOS v12 (USA)",      md5: "C8C49AE9BE7A43D21B23B18A87B62B88" },
    "gba_bios.bin":  { name: "GBA BIOS (normatt)",      md5: "A860E8C0B6D573D191E4EC7DB1B1E4F6" },
    "dc_bios.bin":   { name: "Dreamcast BIOS v1.01d",   md5: "5454841F2D748ACA7955AA6B1BE5810A" },
    "discsystem.rom":{ name: "Famicom Disc System",     md5: "CA30B50F880EB660A320674ED365EF7A" },
  };

  app.get("/api/bios/verify", async (_req, res) => {
    const config = await getVaultConfig();
    const biosDir: string = config.bios_path;
    if (!biosDir) return res.json({ bios_path: null, files: [] });

    const results: object[] = [];
    try {
      const entries = await readdir(biosDir);
      for (const filename of entries) {
        const fullPath = path.join(biosDir, filename);
        const ext = path.extname(filename).toLowerCase();
        if (![".bin", ".rom", ".img"].includes(ext)) continue;
        const known = KNOWN_BIOS[filename.toLowerCase()];
        try {
          const s = await stat(fullPath);
          const hash = await hashFileMd5(fullPath);
          results.push({
            filename,
            name: known?.name ?? filename,
            status: known ? (hash === known.md5 ? "VERIFIED" : "HASH_MISMATCH") : "UNVERIFIED",
            size: (s.size / 1024).toFixed(0) + " KB",
            hash,
          });
        } catch {
          results.push({ filename, name: known?.name ?? filename, status: "UNREADABLE", size: "0 KB" });
        }
      }
    } catch {
      return res.json({ bios_path: biosDir, files: [], error: "Cannot read BIOS directory" });
    }
    res.json({ bios_path: biosDir, files: results });
  });

  // ── Game Launch ───────────────────────────────────────────────
  app.post("/api/games/launch", async (req, res) => {
    const { game_id, gpu_profile } = req.body as { game_id: string; gpu_profile?: string };
    let config = await getVaultConfig();

    if (!config.root_path) return res.status(400).json({ error: "Vault root not configured — set it in the Vault Manager" });

    // Auto-detect RetroArch if not configured
    if (!config.emulator_path) {
      for (const candidate of RETROARCH_CANDIDATES) {
        try {
          await fsAccess(candidate);
          config.emulator_path = candidate;
          if (dbConnected && pool) {
            await pool.query("UPDATE vault_config SET emulator_path=$1 WHERE id=1", [candidate]).catch(() => {});
          }
          mem.vaultConfig.emulator_path = candidate;
          log("INFO", `Emulator auto-detected for launch: ${candidate}`, "launcher");
          break;
        } catch { /* keep searching */ }
      }
    }

    if (!config.emulator_path) {
      return res.status(400).json({ error: "Emulator not found — install RetroArch or set EMULATOR_PATH in .env" });
    }

    let game: Record<string, any> | null = null;
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT * FROM games WHERE id=$1", [game_id]);
        game = r.rows[0] ?? null;
      } catch { /* fall through */ }
    }
    if (!game) game = mem.games.find((g) => g.id === game_id) as any ?? null;
    if (!game) return res.status(404).json({ error: "Game not found" });

    const romPath = path.resolve(config.root_path, (game.relative_path ?? game.relativePath ?? ""));

    // Verify ROM file exists
    try { await fsAccess(romPath); } catch {
      return res.status(404).json({ error: `ROM file not found at ${romPath}` });
    }

    const emulatorExe: string = config.emulator_path;
    const args: string[] = [];
    const coreInfo = PLATFORM_CORES[game.platform ?? "unknown"] ?? PLATFORM_CORES.unknown;

    if (emulatorExe.toLowerCase().includes("retroarch")) {
      const retroarchDir = path.dirname(emulatorExe);
      const coreExt = process.platform === "win32" ? ".dll" : ".so";
      const corePath = path.join(retroarchDir, "cores", `${coreInfo.coreId}_libretro${coreExt}`);

      // Check core exists; if not, return a specific error so the UI can prompt to download
      try { await fsAccess(corePath); } catch {
        return res.status(422).json({
          error: `Core not installed: ${coreInfo.coreName} (${coreInfo.coreId}) — go to Core Forge to download it`,
          core_id: coreInfo.coreId,
          core_name: coreInfo.coreName,
          platform: game.platform,
        });
      }

      args.push("-L", corePath);
      if (gpu_profile === "4k") {
        args.push("--set-shader", "shaders/presets/crt_royale.slangp");
      } else if (gpu_profile === "1080p") {
        args.push("--set-shader", "shaders/presets/crt-hyllian.slangp");
      }
      args.push(romPath);
    } else {
      args.push(romPath);
    }

    log("INFO", `Launching: ${game.title ?? game.id} via ${coreInfo.coreName} [${game.platform}]`, "launcher");

    try {
      const child = spawn(emulatorExe, args, { detached: true, stdio: "ignore" });
      child.unref();
      if (dbConnected && pool) {
        pool.query("UPDATE games SET last_played=NOW() WHERE id=$1", [game_id]).catch(() => {});
      }
      log("INFO", `Emulator spawned (PID: ${child.pid}) — ${game.title}`, "launcher");
      res.json({ success: true, pid: child.pid });
    } catch (err) {
      log("ERROR", `Launch failed: ${err}`, "launcher");
      res.status(500).json({ error: String(err) });
    }
  });

  // ── AI Guide ──────────────────────────────────────────────────
  app.post("/api/ai/guide", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "GEMINI_API_KEY not configured" });
    const { game_title, platform, query } = req.body as Record<string, string>;
    if (!query?.trim()) return res.status(400).json({ error: "query required" });

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are Nexus AI, an expert integrated into the Nexus Emu gaming management suite.
Game: "${game_title}" (${platform ?? "Unknown Platform"})
User query: "${query}"
Provide a focused, knowledgeable response. Include tips, strategies, speedrun notes, or dev trivia where relevant.
Keep it concise (2-4 short paragraphs). High-tech tone — you are a gaming AI, not a casual assistant.`,
      });
      log("INFO", `AI Guide queried for: ${game_title}`, "ai");
      res.json({ response: result.text });
    } catch (err) {
      log("ERROR", `AI Guide error: ${err}`, "ai");
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/ai/scrape", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "GEMINI_API_KEY not configured" });
    const { filename } = req.body as { filename: string };
    if (!filename) return res.status(400).json({ error: "filename required" });

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are the Nexus Emu Metadata Scraper. Extract metadata from this ROM filename: "${filename}". Return ONLY a valid JSON object: { title, platform, year, genre, description, confidence (0-1) }.`,
        config: { responseMimeType: "application/json" },
      });
      res.json(JSON.parse(result.text.trim()));
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ── Playlists ─────────────────────────────────────────────────
  app.get("/api/playlists", async (_req, res) => {
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT * FROM playlists ORDER BY created_at ASC");
        return res.json(r.rows);
      } catch { /* fall through */ }
    }
    res.json([]);
  });

  app.post("/api/playlists", async (req, res) => {
    const { name, game_ids, is_portable } = req.body as {
      name: string; game_ids: string[]; is_portable: boolean;
    };
    if (dbConnected && pool) {
      try {
        const r = await pool.query(
          "INSERT INTO playlists (name,game_ids,is_portable) VALUES ($1,$2,$3) RETURNING *",
          [name, game_ids ?? [], is_portable ?? false]
        );
        log("INFO", `Playlist created: ${name}`, "playlists");
        return res.json(r.rows[0]);
      } catch (err) {
        return res.status(500).json({ error: String(err) });
      }
    }
    res.status(503).json({ error: "Database not connected" });
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    const { id } = req.params;
    const { game_ids } = req.body as { game_ids: string[] };
    if (dbConnected && pool) {
      try {
        await pool.query("UPDATE playlists SET game_ids=$1 WHERE id=$2", [game_ids, id]);
        return res.json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: String(err) });
      }
    }
    res.status(503).json({ error: "Database not connected" });
  });

  // ── Watcher Status ────────────────────────────────────────────
  app.get("/api/watcher/status", (_req, res) => {
    res.json({
      active: fileWatcher !== null,
      watchingPath: watcherRoot,
      pendingDebounce: debounceMap.size,
    });
  });

  // ── Platform Cores ────────────────────────────────────────────
  app.get("/api/cores", (_req, res) => {
    res.json(PLATFORM_CORES);
  });

  // ── Network Info (for remote pairing QR) ─────────────────────
  app.get("/api/network/info", async (_req, res) => {
    const ifaces = os.networkInterfaces();
    const addresses: string[] = [];
    const labels: Record<string, 'tailscale' | 'lan' | 'vpn'> = {};
    for (const [name, list] of Object.entries(ifaces)) {
      for (const iface of list ?? []) {
        if (iface.family === "IPv4" && !iface.internal) {
          addresses.push(iface.address);
          // Tailscale uses 100.64.0.0/10 (100.64.x.x – 100.127.x.x)
          const parts = iface.address.split('.').map(Number);
          const isTailscale = parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
          // Common VPN ranges (10.x, 172.16-31.x) — but not 10.x LAN which is ambiguous
          const isVpnName = /vpn|tun|tap|wg|wireguard/i.test(name);
          labels[iface.address] = isTailscale ? 'tailscale' : isVpnName ? 'vpn' : 'lan';
        }
      }
    }
    // Sort: tailscale first, then lan, then vpn
    addresses.sort((a, b) => {
      const order = { tailscale: 0, lan: 1, vpn: 2 };
      return order[labels[a]] - order[labels[b]];
    });
    const urls = addresses.map((a) => `http://${a}:${PORT}`);
    // Generate QR code for best URL (prefer Tailscale, else first LAN)
    let qrDataUrl: string | null = null;
    const bestUrl = urls[0];
    if (bestUrl) {
      try { qrDataUrl = await QRCode.toDataURL(bestUrl, { width: 200, margin: 1, color: { dark: "#00f0ff", light: "#0d0d1a" } }); } catch { /* ok */ }
    }
    res.json({ addresses, port: PORT, urls, labels, qrDataUrl });
  });

  // ── Auth ──────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, display_name } = req.body as { username: string; password: string; display_name?: string };
    if (!username?.trim() || !password) return res.status(400).json({ error: "username and password required" });
    if (username.trim().length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (!dbConnected || !pool) return res.status(503).json({ error: "Database not connected" });
    const passwordHash = hashPassword(password);
    try {
      const r = await pool.query(
        `INSERT INTO users (username, display_name, password_hash) VALUES ($1,$2,$3) RETURNING id, username, display_name, created_at`,
        [username.toLowerCase().trim(), display_name?.trim() || null, passwordHash]
      );
      const u = r.rows[0];
      const token = jwt.sign({ userId: u.id, username: u.username }, JWT_SECRET, { expiresIn: "30d" });
      log("INFO", `New user registered: ${u.username}`, "auth");
      res.json({ token, user: { id: u.id, username: u.username, display_name: u.display_name, created_at: u.created_at } });
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ error: "Username already taken" });
      log("ERROR", `Register error: ${err}`, "auth");
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Supports username+password (accounts) OR legacy PIN (mobile remote)
  app.post("/api/auth/login", async (req, res) => {
    const { username, password, pin } = req.body as { username?: string; password?: string; pin?: string };

    // Legacy PIN auth
    if (pin !== undefined) {
      if (!ACCESS_PIN) return res.status(503).json({ error: "ACCESS_PIN not set in .env" });
      const pinBuf = Buffer.from(pin);
      const expBuf = Buffer.from(ACCESS_PIN);
      if (pinBuf.length !== expBuf.length || !crypto.timingSafeEqual(pinBuf, expBuf)) {
        log("WARN", "Failed PIN auth attempt", "auth");
        return res.status(401).json({ error: "Invalid PIN" });
      }
      const token = jwt.sign({ nexus: true, ts: Date.now() }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token });
    }

    // Username + password
    if (!username?.trim() || !password) return res.status(400).json({ error: "username and password required" });
    if (!dbConnected || !pool) return res.status(503).json({ error: "Database not connected" });
    try {
      const r = await pool.query("SELECT * FROM users WHERE username=$1", [username.toLowerCase().trim()]);
      const u = r.rows[0];
      if (!u || !verifyPassword(password, u.password_hash)) {
        log("WARN", `Failed login: ${username}`, "auth");
        return res.status(401).json({ error: "Invalid username or password" });
      }
      await pool.query("UPDATE users SET last_seen=NOW() WHERE id=$1", [u.id]).catch(() => {});
      const token = jwt.sign({ userId: u.id, username: u.username }, JWT_SECRET, { expiresIn: "30d" });
      log("INFO", `User logged in: ${u.username}`, "auth");
      res.json({ token, user: { id: u.id, username: u.username, display_name: u.display_name, created_at: u.created_at } });
    } catch (err) {
      log("ERROR", `Login error: ${err}`, "auth");
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "No token" });
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (!payload.userId) return res.status(401).json({ error: "Token has no user" });
      if (!dbConnected || !pool) return res.status(503).json({ error: "Database not connected" });
      const r = await pool.query("SELECT id, username, display_name, created_at FROM users WHERE id=$1", [payload.userId]);
      if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
      res.json({ user: r.rows[0] });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/auth/verify", (req, res) => {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ valid: false });
    try { jwt.verify(token, JWT_SECRET); res.json({ valid: true }); }
    catch { res.status(401).json({ valid: false }); }
  });

  // ── Emulator Auto-Detect + Core Download ─────────────────────
  app.get("/api/emulator/detect", async (_req, res) => {
    for (const candidate of RETROARCH_CANDIDATES) {
      try {
        await fsAccess(candidate);
        if (dbConnected && pool) {
          await pool.query(
            "UPDATE vault_config SET emulator_path=$1, updated_at=NOW() WHERE id=1 AND emulator_path=''",
            [candidate]
          ).catch(() => {});
        }
        if (!mem.vaultConfig.emulator_path) mem.vaultConfig.emulator_path = candidate;
        log("INFO", `RetroArch auto-detected: ${candidate}`, "launcher");
        return res.json({ found: true, path: candidate });
      } catch { /* not there */ }
    }
    res.json({ found: false, candidates: RETROARCH_CANDIDATES });
  });

  app.get("/api/emulator/cores/status/:platform", async (req, res) => {
    const { platform } = req.params;
    const config = await getVaultConfig();
    if (!config.emulator_path) return res.json({ has_emulator: false, has_core: false });
    const coreInfo = PLATFORM_CORES[platform] ?? PLATFORM_CORES.unknown;
    const coresDirPath = path.join(path.dirname(config.emulator_path), "cores");
    const corePath = path.join(coresDirPath, `${coreInfo.coreId}_libretro.dll`);
    let has_core = false;
    try { await fsAccess(corePath); has_core = true; } catch { /* missing */ }
    res.json({ has_emulator: true, has_core, emulator_path: config.emulator_path,
      core_id: coreInfo.coreId, core_name: coreInfo.coreName, core_path: corePath });
  });

  app.post("/api/emulator/cores/download", async (req, res) => {
    const { platform } = req.body as { platform: string };
    const config = await getVaultConfig();
    if (!config.emulator_path) return res.status(400).json({ error: "RetroArch not configured" });
    const coreInfo = PLATFORM_CORES[platform] ?? PLATFORM_CORES.unknown;
    if (coreInfo.coreId === "detect") return res.status(400).json({ error: "Unknown platform — cannot auto-download" });
    const coresDirPath = path.join(path.dirname(config.emulator_path), "cores");
    const coreName = `${coreInfo.coreId}_libretro.dll`;
    const zipName  = `${coreName}.zip`;
    const zipPath  = path.join(coresDirPath, zipName);
    const destPath = path.join(coresDirPath, coreName);
    const url = `https://buildbot.libretro.com/nightly/windows/x86_64/latest/${zipName}`;
    log("INFO", `Downloading core: ${coreInfo.coreName} from buildbot`, "launcher");
    try {
      await mkdir(coresDirPath, { recursive: true });
      await execAsync(
        `powershell -NoProfile -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${zipPath}' -UseBasicParsing; Expand-Archive -Path '${zipPath}' -DestinationPath '${coresDirPath}' -Force; Remove-Item '${zipPath}' -ErrorAction SilentlyContinue"`,
        { timeout: 180_000 }
      );
      let has_core = false;
      try { await fsAccess(destPath); has_core = true; } catch { /* may be in subdir */ }
      log("INFO", `Core installed: ${coreInfo.coreName}`, "launcher");
      res.json({ success: true, core_path: destPath, has_core, core_name: coreInfo.coreName });
    } catch (err) {
      log("ERROR", `Core download failed: ${err}`, "launcher");
      res.status(500).json({ error: String(err) });
    }
  });

  // ── Game Download (for mobile / device transfer) ──────────────
  app.get("/api/games/:id/download", async (req, res) => {
    const { id } = req.params;
    const config = await getVaultConfig();
    if (!config.root_path) return res.status(400).json({ error: "Vault not configured" });

    let game: Record<string, any> | null = null;
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT * FROM games WHERE id=$1", [id]);
        game = r.rows[0] ?? null;
      } catch { /* fall through */ }
    }
    if (!game) game = (mem.games.find((g) => g.id === id) as any) ?? null;
    if (!game) return res.status(404).json({ error: "Game not found" });

    const relPath = (game.relative_path ?? "").replace(/^\.\//, "");
    const filePath = path.resolve(config.root_path, relPath);
    try { await fsAccess(filePath); } catch {
      return res.status(404).json({ error: "ROM file not found on disk" });
    }
    const filename = path.basename(filePath);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    const stream = createReadStream(filePath);
    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
    log("INFO", `ROM download: ${filename}`, "remote");
  });

  // ── Auto-scan a single file (dropped externally) ──────────────
  app.post("/api/vault/ingest", async (req, res) => {
    const { file_path } = req.body as { file_path: string };
    if (!file_path) return res.status(400).json({ error: "file_path required" });
    const config = await getVaultConfig();
    if (!config.root_path) return res.status(400).json({ error: "Vault root not configured" });
    await processNewRom(file_path, config.root_path);
    res.json({ success: true });
  });

  // ── Art Serving ───────────────────────────────────────────────
  app.get("/api/art/:gameId", async (req, res) => {
    const id = req.params.gameId.replace(/[^a-zA-Z0-9_-]/g, "");
    await ensureArtDir();
    const mimes: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
    for (const ext of [".png", ".jpg", ".jpeg"]) {
      const p = path.join(ART_DIR, id + ext);
      try {
        await fsAccess(p);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Content-Type", mimes[ext]);
        createReadStream(p).pipe(res);
        return;
      } catch { /* try next */ }
    }
    res.status(404).end();
  });

  // ── Fetch art for a single game ───────────────────────────────
  app.post("/api/games/:id/fetch-art", async (req, res) => {
    const { id } = req.params;
    let title = "", platform = "unknown";
    if (dbConnected && pool) {
      try {
        const r = await pool.query("SELECT title, platform FROM games WHERE id=$1", [id]);
        if (r.rows.length) { title = r.rows[0].title; platform = r.rows[0].platform; }
      } catch { /* fall through */ }
    } else {
      const g = mem.games.find((g) => g.id === id);
      if (g) { title = g.title; platform = g.platform; }
    }
    if (!title) return res.status(404).json({ error: "Game not found" });

    const artUrl = await fetchAndSaveArt(id, title, platform);
    if (!artUrl) return res.json({ success: false, message: "Art not found in libretro thumbnails" });

    if (dbConnected && pool) {
      await pool.query("UPDATE games SET box_art=$1, updated_at=NOW() WHERE id=$2", [artUrl, id]).catch(() => {});
    } else {
      const g = mem.games.find((g) => g.id === id);
      if (g) (g as any).boxArt = artUrl;
    }
    res.json({ success: true, artUrl });
  });

  // ── Batch fetch art for games missing boxart ──────────────────
  app.post("/api/art/fetch-batch", async (req, res) => {
    const limit = Math.min(parseInt(String((req.body as any)?.limit ?? 100)), 500);
    let games: { id: string; title: string; platform: string }[] = [];
    if (dbConnected && pool) {
      try {
        const r = await pool.query(
          "SELECT id, title, platform FROM games WHERE box_art='' OR box_art IS NULL LIMIT $1",
          [limit]
        );
        games = r.rows;
      } catch { /* fall through */ }
    }
    if (!games.length) games = mem.games.filter((g) => !g.boxArt).slice(0, limit).map((g) => ({ id: g.id, title: g.title, platform: g.platform }));

    res.json({ started: true, count: games.length });

    // Process in background with rate-limiting
    (async () => {
      let fetched = 0;
      for (const game of games) {
        const artUrl = await fetchAndSaveArt(game.id, game.title, game.platform);
        if (artUrl) {
          fetched++;
          if (dbConnected && pool) {
            await pool.query("UPDATE games SET box_art=$1, updated_at=NOW() WHERE id=$2", [artUrl, game.id]).catch(() => {});
          } else {
            const g = mem.games.find((g) => g.id === game.id);
            if (g) (g as any).boxArt = artUrl;
          }
        }
        await new Promise((r) => setTimeout(r, 150)); // be polite to libretro CDN
      }
      log("INFO", `Batch art fetch: ${fetched}/${games.length} found`, "art");
    })().catch((e) => log("ERROR", `Batch art error: ${e}`, "art"));
  });

  // ── Filesystem Browser (for mobile/web folder picker) ─────────
  app.post("/api/fs/mkdir", async (req, res) => {
    const { path: dirPath } = req.body as { path: string };
    if (!dirPath || typeof dirPath !== "string") return res.status(400).json({ error: "path required" });
    const resolved = path.resolve(dirPath);
    try {
      await mkdir(resolved, { recursive: true });
      res.json({ created: resolved });
    } catch (e: unknown) {
      res.status(500).json({ error: (e as NodeJS.ErrnoException).message });
    }
  });

  app.get("/api/fs/roots", async (_req, res) => {
    if (process.platform === "win32") {
      try {
        const { stdout } = await execAsync("wmic logicaldisk get name", { timeout: 5000 });
        const drives = stdout
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => /^[A-Z]:$/.test(l))
          .map((d) => ({ name: d + "\\", path: d + "\\", type: "drive" }));
        return res.json({ roots: drives.length ? drives : [{ name: "C:\\", path: "C:\\", type: "drive" }] });
      } catch {
        return res.json({ roots: [{ name: "C:\\", path: "C:\\", type: "drive" }] });
      }
    }
    res.json({ roots: [{ name: "/", path: "/", type: "root" }] });
  });

  // Windows system dirs to hide from listing
  const WIN_HIDDEN = new Set([
    '$recycle.bin', 'system volume information', 'recovery', '$windows.~bt',
    '$windows.~ws', 'windows.old', 'dumpstack.log.tmp', 'hiberfil.sys',
    'pagefile.sys', 'swapfile.sys', 'msocache', 'perflogs', 'documents and settings',
    'program data',
  ]);

  app.get("/api/fs/suggest", async (_req, res) => {
    const suggestions: { label: string; path: string; hint?: string }[] = [];
    const drives: string[] = ['C:\\'];

    if (process.platform === 'win32') {
      try {
        const { stdout } = await execAsync('wmic logicaldisk get name', { timeout: 5000 });
        const detected = stdout.split('\n').map(l => l.trim()).filter(l => /^[A-Z]:$/.test(l)).map(d => d + '\\');
        drives.splice(0, drives.length, ...detected);
      } catch { /* use C:\ fallback */ }
    }

    for (const drive of drives) {
      const label = drive.replace('\\', '');
      for (const folder of ['Games', 'ROMs', 'Emulation', 'Roms', 'Games\\ROMs']) {
        const p = path.join(drive, folder);
        try { await fsAccess(p); suggestions.push({ label: `${label}\\${folder.replace('\\', '\\')}`, path: p, hint: 'Existing folder' }); } catch { /* skip */ }
      }
      suggestions.push({ label: `${label}\\Games\\ROMs (create)`, path: path.join(drive, 'Games', 'ROMs'), hint: 'Will be created' });
      if (drive !== 'C:\\') {
        suggestions.push({ label: `${label}\\ROMs (create)`, path: path.join(drive, 'ROMs'), hint: 'Will be created' });
      }
    }

    // Add user home directories on Windows
    const home = process.env.USERPROFILE || process.env.HOME;
    if (home) {
      for (const sub of ['Games', 'ROMs', 'Documents\\Games']) {
        const p = path.join(home, sub);
        try { await fsAccess(p); suggestions.push({ label: `~\\${sub}`, path: p, hint: 'Existing folder' }); } catch { /* skip */ }
      }
    }

    res.json({ suggestions, drives: drives.map(d => ({ name: d, path: d, type: 'drive' })) });
  });

  app.get("/api/fs/list", async (req, res) => {
    const dirPath = req.query.path as string;
    const showFiles = req.query.files === "true";
    if (!dirPath) return res.status(400).json({ error: "path required" });

    const resolved = path.resolve(dirPath);
    try {
      await fsAccess(resolved);
      const rawEntries = await readdir(resolved, { withFileTypes: true });
      const result: { name: string; path: string; type: string; isDir: boolean }[] = [];
      for (const e of rawEntries) {
        if (e.name.startsWith('.')) continue;
        if (WIN_HIDDEN.has(e.name.toLowerCase())) continue;
        try {
          const isDir = e.isDirectory();
          if (!showFiles && !isDir) continue;
          result.push({ name: e.name, path: path.join(resolved, e.name), type: isDir ? 'dir' : 'file', isDir });
        } catch { /* skip inaccessible entry */ }
      }
      result.sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
      const parent = path.dirname(resolved);
      res.json({ current: resolved, parent: parent !== resolved ? parent : null, entries: result });
    } catch {
      res.status(403).json({ error: `Cannot read: ${resolved}` });
    }
  });

  // ── LaunchBox Images Folder Scanner ──────────────────────────
  app.post("/api/art/scan-launchbox-images", async (req, res) => {
    const { images_path } = req.body as { images_path: string };
    if (!images_path) return res.status(400).json({ error: "images_path required" });

    try { await fsAccess(images_path); } catch {
      return res.status(400).json({ error: `Folder not found: ${images_path}` });
    }

    // Respond immediately — process in background
    res.json({ started: true, message: "LaunchBox image scan started in background" });

    (async () => {
      let matched = 0, skipped = 0;
      await ensureArtDir();

      // Build lookup: normalised title → game row
      const { rows: allGames } = await pool.query("SELECT id, title, platform FROM games");
      const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const titleMap = new Map<string, { id: number; platform: string }>();
      for (const g of allGames) {
        titleMap.set(normalize(g.title), { id: g.id, platform: g.platform });
      }

      try {
        const platformDirs = await readdir(images_path, { withFileTypes: true });
        for (const pd of platformDirs) {
          if (!pd.isDirectory()) continue;
          const platformName = pd.name;
          // skip cache / media packs / system folders
          if (/^cache|media pack|platform categor|platforms$/i.test(platformName)) continue;

          const platformPath = path.join(images_path, platformName);
          const artSubfolders = ["Box - Front", "Box - Front - Reconstructed", "Fanart - Box - Front", "Clear Logo"];

          for (const sub of artSubfolders) {
            const subPath = path.join(platformPath, sub);
            try { await fsAccess(subPath); } catch { continue; }

            const files = await readdir(subPath);
            for (const file of files) {
              const ext = path.extname(file).toLowerCase();
              if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;
              const titleRaw = path.basename(file, ext);
              const key = normalize(titleRaw);

              const match = titleMap.get(key);
              if (!match) { skipped++; continue; }

              const dest = path.join(ART_DIR, `${match.id}${ext}`);
              try {
                await fsAccess(dest);
                // already have art — skip unless it's a higher-priority subfolder
                if (sub !== "Box - Front") continue;
              } catch { /* dest doesn't exist, proceed */ }

              try {
                const src = path.join(subPath, file);
                const buf = await readFile(src);
                await writeFile(dest, buf);
                const artUrl = `/api/art/${match.id}`;
                await pool.query("UPDATE games SET box_art = $1 WHERE id = $2", [artUrl, match.id]);
                matched++;
              } catch { /* skip unreadable */ }
            }
          }
        }
      } catch (e) {
        console.error("[art-scan] LaunchBox images scan error:", e);
      }
      console.log(`[art-scan] Done — matched ${matched} games, skipped ${skipped} unmatched files`);
    })();
  });

  // ── LaunchBox Import ──────────────────────────────────────────
  app.post("/api/vault/import-launchbox", async (req, res) => {
    const { launchbox_path } = req.body as { launchbox_path: string };
    if (!launchbox_path) return res.status(400).json({ error: "launchbox_path required" });

    const dataDir = path.join(launchbox_path, "Data", "Platforms");
    try { await fsAccess(dataDir); } catch {
      return res.status(400).json({ error: `LaunchBox Data/Platforms folder not found at: ${dataDir}` });
    }

    res.json({ started: true, message: "LaunchBox import started in background" });

    (async () => {
      let totalImported = 0, totalArt = 0;
      try {
        const xmlFiles = (await readdir(dataDir)).filter((f) => f.endsWith(".xml"));
        for (const xmlFile of xmlFiles) {
          const lbPlatformName = path.basename(xmlFile, ".xml");
          const platform = lbPlatformToNexus(lbPlatformName);
          let xmlContent = "";
          try { xmlContent = await readFile(path.join(dataDir, xmlFile), "utf-8"); } catch { continue; }

          const gameBlocks = xmlContent.match(/<Game>([\s\S]*?)<\/Game>/g) ?? [];
          for (const block of gameBlocks) {
            const get = (tag: string) => {
              const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
              return m ? m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim() : "";
            };
            const title = get("Title");
            const appPath = get("ApplicationPath");
            if (!title) continue;

            const gameId = crypto.createHash("md5").update((appPath || title + lbPlatformName).replace(/\\/g, "/")).digest("hex");

            // Try to find and copy art
            let artUrl = "";
            await ensureArtDir();
            const artRoot = path.join(launchbox_path, "Images", lbPlatformName);
            const artFile = await findLbArt(artRoot, title);
            if (artFile) {
              try {
                const ext = path.extname(artFile).toLowerCase();
                const dest = path.join(ART_DIR, gameId + ext);
                await writeFile(dest, await readFile(artFile));
                artUrl = `/api/art/${gameId}`;
                totalArt++;
              } catch { /* ok */ }
            }

            // If no local art, try libretro
            if (!artUrl) {
              try {
                const fetched = await fsAccess(path.join(ART_DIR, `${gameId}.png`)).then(() => `/api/art/${gameId}`).catch(() => null);
                artUrl = fetched ?? "";
              } catch { /* ok */ }
            }

            const game = {
              id: gameId,
              title,
              platform,
              relative_path: appPath || title,
              box_art: artUrl,
              hero_image: "",
              playtime: 0,
              sync_status: "synced",
              dominant_color: "#1a1a2e",
              description: get("Notes"),
              developer: get("Developer"),
              publisher: get("Publisher"),
              release_date: (get("ReleaseDate") || "").substring(0, 10),
              genre: get("Genre") ? [get("Genre")] : [],
              players: get("MaxPlayers") || "1",
              rating: Math.round(parseFloat(get("StarRatingFloat") || "0") * 20),
              file_hash: "",
            };

            if (dbConnected && pool) {
              try {
                await pool.query(
                  `INSERT INTO games (id,title,platform,relative_path,box_art,hero_image,playtime,sync_status,
                     dominant_color,description,developer,publisher,release_date,genre,players,rating)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
                   ON CONFLICT (id) DO UPDATE SET
                     box_art        = CASE WHEN EXCLUDED.box_art != '' THEN EXCLUDED.box_art ELSE games.box_art END,
                     description    = CASE WHEN EXCLUDED.description != '' THEN EXCLUDED.description ELSE games.description END,
                     developer      = CASE WHEN EXCLUDED.developer != '' THEN EXCLUDED.developer ELSE games.developer END,
                     publisher      = CASE WHEN EXCLUDED.publisher != '' THEN EXCLUDED.publisher ELSE games.publisher END,
                     updated_at     = NOW()`,
                  [game.id, game.title, game.platform, game.relative_path, game.box_art, game.hero_image,
                   game.playtime, game.sync_status, game.dominant_color, game.description, game.developer,
                   game.publisher, game.release_date, game.genre, game.players, game.rating]
                );
                totalImported++;
              } catch { /* continue */ }
            } else {
              if (!mem.games.find((g) => g.id === gameId)) {
                mem.games.push(rowToGame(game));
                totalImported++;
              }
            }
          }
        }
        log("INFO", `LaunchBox import complete — ${totalImported} games, ${totalArt} artworks`, "vault");
      } catch (err) {
        log("ERROR", `LaunchBox import error: ${err}`, "vault");
      }
    })().catch(() => {});
  });

  // ── Vite / Static ─────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Hashed assets (/_assets/*.js, *.css) → immutable cache 1 year
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    // Everything else — short cache
    app.use(express.static(distPath, { maxAge: '5m' }));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  // ── Start ─────────────────────────────────────────────────────
  startCpuSampling();
  pollGpu();

  // Boot the Ghost Scanner
  getVaultConfig().then((cfg) => {
    if (cfg.root_path) startVaultWatcher(cfg.root_path).catch(() => {});
  });

  app.listen(PORT, "0.0.0.0", () => {
    log("INFO", `Nexus Server online — http://localhost:${PORT}`, "kernel");
    log("INFO", `Database: ${dbConnected ? "Neon PostgreSQL connected" : "Memory-only mode"}`, "kernel");
    log("INFO", `AI Core: ${ai ? "Gemini online" : "No API key — AI disabled"}`, "kernel");
    log("INFO", `GPU Telemetry: ${gpuLoadCache >= 0 ? "nvidia-smi active" : "Initializing..."}`, "kernel");
  });
}

startServer();
