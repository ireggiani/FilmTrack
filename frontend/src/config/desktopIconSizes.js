// Desktop icon sizes, chosen from the desktop's right-click menu or the Desktop
// Icons window. image: the icon picture (px); width: the icon cell, which the
// label wraps to; cellW/cellH: the grid stride between icons. The cell never
// gets narrower than Medium's, so two-word labels like "Movies Collection"
// still wrap to two lines instead of splitting a word.
export const DESKTOP_ICON_SIZES = [
  { id: 'small', label: 'Small', image: 32, width: 72, cellW: 84, cellH: 76 },
  { id: 'medium', label: 'Medium', image: 48, width: 72, cellW: 88, cellH: 92 },
  { id: 'large', label: 'Large', image: 64, width: 88, cellW: 104, cellH: 108 },
  { id: 'xlarge', label: 'Extra large', image: 96, width: 112, cellW: 128, cellH: 140 },
];

export const DESKTOP_ICON_SIZE_MAP = Object.fromEntries(
  DESKTOP_ICON_SIZES.map((size) => [size.id, size]),
);

export const DESKTOP_ICON_SIZE_IDS = DESKTOP_ICON_SIZES.map((size) => size.id);

export const DEFAULT_DESKTOP_ICON_SIZE = 'medium';
