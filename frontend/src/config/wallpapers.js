// Built-in wallpapers shown in Wallpaper Settings. Scenes fill the screen;
// patterns are square tiles repeated at their native size (`size`, in px —
// must match the SVG's width/height). To add one, drop the SVG in
// assets/wallpapers/ and list it here.
import filmstrip from '../assets/wallpapers/filmstrip.svg';
import projector from '../assets/wallpapers/projector.svg';
import aurora from '../assets/wallpapers/aurora.svg';
import premiere from '../assets/wallpapers/premiere.svg';
import meadow from '../assets/wallpapers/meadow.svg';
import sprockets from '../assets/wallpapers/sprockets.svg';
import stars from '../assets/wallpapers/stars.svg';
import tickets from '../assets/wallpapers/tickets.svg';
import reels from '../assets/wallpapers/reels.svg';

export const SCENES = [
  { id: 'filmstrip', name: 'Film Strip', url: filmstrip },
  { id: 'projector', name: 'Projector Beam', url: projector },
  { id: 'aurora', name: 'Aurora Reel', url: aurora },
  { id: 'premiere', name: 'Premiere Night', url: premiere },
  { id: 'meadow', name: 'Meadow Matinee', url: meadow },
];

export const PATTERNS = [
  { id: 'sprockets', name: 'Sprocket Weave', url: sprockets, size: 160 },
  { id: 'stars', name: 'Stars & Popcorn', url: stars, size: 200 },
  { id: 'tickets', name: 'Ticket Stubs', url: tickets, size: 240 },
  { id: 'reels', name: 'Reel Grid', url: reels, size: 120 },
].map((pattern) => ({ ...pattern, tile: true }));

export const WALLPAPER_MAP = Object.fromEntries(
  [...SCENES, ...PATTERNS].map((w) => [w.id, w]),
);

// Also the body's CSS background (globals.scss), so it shows before React loads
export const DEFAULT_WALLPAPER_ID = 'filmstrip';

// Selection id for the user's own uploaded picture
export const CUSTOM_WALLPAPER_ID = 'custom';
