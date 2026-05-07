import { Game } from '../types';

export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'The Legend of Zelda: Ocarina of Time',
    platform: 'n64',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcp.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc66z0.webp',
    playtime: 1240,
    lastPlayed: '2024-05-01T14:30:00Z',
    syncStatus: 'synced',
    dominantColor: '#2d4a22',
    metadata: {
      description: 'The Legend of Zelda: Ocarina of Time is an action-adventure game developed and published by Nintendo for the Nintendo 64. It was released in Japan and North America in November 1998, and in Europe and Australia the following month.',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      releaseDate: '1998-11-21',
      genre: ['Action', 'Adventure'],
      players: '1',
      rating: 98
    }
  },
  {
    id: '2',
    title: 'Super Metroid',
    platform: 'snes',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9m.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc5i7o.webp',
    playtime: 450,
    lastPlayed: '2024-04-28T09:15:00Z',
    syncStatus: 'synced',
    dominantColor: '#4a1212',
    metadata: {
      description: 'Super Metroid is an action-adventure game developed by Nintendo R&D1 and published by Nintendo for the Super Nintendo Entertainment System in 1994.',
      developer: 'Nintendo R&D1',
      publisher: 'Nintendo',
      releaseDate: '1994-03-19',
      genre: ['Action', 'Platformer'],
      players: '1',
      rating: 96
    }
  },
  {
    id: '3',
    title: 'Metal Gear Solid',
    platform: 'ps1',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc7k9p.webp',
    playtime: 890,
    lastPlayed: '2024-05-05T21:45:00Z',
    syncStatus: 'pending',
    dominantColor: '#4a4a4a',
    metadata: {
      description: 'Metal Gear Solid is a stealth game developed by Konami Computer Entertainment Japan and published by Konami for the PlayStation in 1998.',
      developer: 'Konami Computer Entertainment Japan',
      publisher: 'Konami',
      releaseDate: '1998-09-03',
      genre: ['Stealth', 'Action'],
      players: '1',
      rating: 94
    }
  },
  {
    id: '4',
    title: 'Castlevania: Symphony of the Night',
    platform: 'ps1',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tp6.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc5j6n.webp',
    playtime: 1500,
    lastPlayed: '2024-05-02T18:20:00Z',
    syncStatus: 'synced',
    dominantColor: '#2b0a0a',
    metadata: {
      description: 'Castlevania: Symphony of the Night is a classic action-adventure platformer that shifted the series in a bold new direction.',
      developer: 'Konami Computer Entertainment Tokyo',
      publisher: 'Konami',
      releaseDate: '1997-03-20',
      genre: ['Action', 'Platformer'],
      players: '1',
      rating: 93
    }
  },
  {
    id: '5',
    title: 'Chrono Trigger',
    platform: 'snes',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tx0.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc7l3o.webp',
    playtime: 2100,
    lastPlayed: '2024-04-30T10:00:00Z',
    syncStatus: 'synced',
    dominantColor: '#4a3a12',
    metadata: {
      description: 'A masterpiece of RPG design, Chrono Trigger follows a young boy named Crono on an epic adventure through time.',
      developer: 'Square',
      publisher: 'Square',
      releaseDate: '1995-03-11',
      genre: ['RPG'],
      players: '1',
      rating: 95
    }
  },
  {
    id: '6',
    title: 'Mario Kart 64',
    platform: 'n64',
    boxArt: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9x.webp',
    heroImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc5m1o.webp',
    playtime: 320,
    lastPlayed: '2024-05-06T12:00:00Z',
    syncStatus: 'synced',
    dominantColor: '#12344a',
    metadata: {
      description: 'The definitive kart racer for the N64, featuring four-player local multiplayer and classic tracks.',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      releaseDate: '1996-12-14',
      genre: ['Racing'],
      players: '1-4',
      rating: 83
    }
  }
];
