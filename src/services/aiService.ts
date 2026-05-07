export interface ScrapedMetadata {
  title: string;
  platform: string;
  year: string;
  genre: string;
  description: string;
  confidence: number;
}

/**
 * Scrape metadata for a ROM filename via the Nexus server API.
 * The server calls Gemini 2.0 Flash and returns structured JSON.
 */
export async function scrapeMetadata(filename: string): Promise<ScrapedMetadata> {
  const res = await fetch('/api/ai/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Ask the Nexus AI Guide about a specific game.
 */
export async function askGameGuide(gamTitle: string, platform: string, query: string): Promise<string> {
  const res = await fetch('/api/ai/guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_title: gamTitle, platform, query }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.response as string;
}

