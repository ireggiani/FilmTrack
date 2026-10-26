import PropTypes from 'prop-types';
import { WINDOW_MAP } from '../../config/windowRegistry';
import {
  DESKTOP_ICON_SIZE_MAP,
  DESKTOP_ICON_SIZE_IDS,
  DEFAULT_DESKTOP_ICON_SIZE,
} from '../../config/desktopIconSizes';
import DesktopIcon from './DesktopIcon';

// Initial grid layout (pixels). The stride between icons (cellW/cellH) comes
// from the chosen icon size in config/desktopIconSizes.js.
const GRID = {
  padX:      16,  // left margin from the desktop edge
  padY:      16,  // top margin from the desktop edge
  maxPerCol:  8,  // icons per column before wrapping to the next column
  taskbar:   30,  // taskbar height, kept clear at the bottom
};

// Icons per row in "rows" arrangement: as many as fit across the desktop
const perRow = ({ cellW }) =>
  Math.max(1, Math.floor((window.innerWidth - GRID.padX * 2) / cellW));

// Icons per column in "columns" arrangement: as many as fit down the desktop,
// up to maxPerCol, so large icons don't run under the taskbar
const perCol = ({ cellH }) =>
  Math.max(
    1,
    Math.min(
      GRID.maxPerCol,
      Math.floor((window.innerHeight - GRID.taskbar - GRID.padY * 2) / cellH),
    ),
  );

/**
 * Maps a flat list index to a grid position: down each column first
 * ("columns"), or across each row first ("rows").
 */
const getInitialPosition = (index, arrange, size) => {
  const across = arrange === 'rows' ? perRow(size) : null;
  const down = perCol(size);
  const col = across ? index % across : Math.floor(index / down);
  const row = across ? Math.floor(index / across) : index % down;
  return { x: GRID.padX + col * size.cellW, y: GRID.padY + row * size.cellH };
};

/**
 * Renders the given desktop icons (ids from the window registry), in order.
 * The key includes the slot index so that adding or removing an icon re-lays
 * every icon out on the grid, instead of leaving gaps or stacking a new icon
 * on top of one that kept its old slot. (Dragged positions aren't persisted
 * yet, so nothing is lost.)
 */
const DesktopIconGrid = ({
  ids,
  arrange = 'columns',
  iconSize = DEFAULT_DESKTOP_ICON_SIZE,
  selectedId,
  onSelect,
  onOpen,
}) => {
  const size = DESKTOP_ICON_SIZE_MAP[iconSize];
  return ids.map((id, index) => {
    const { icon, title } = WINDOW_MAP[id];
    return (
      <DesktopIcon
        // Arrangement and size in the key too, so switching either re-lays
        // out every icon
        key={`${id}@${index}-${arrange}-${iconSize}`}
        icon={icon}
        imageSize={size.image}
        label={title}
        isSelected={selectedId === id}
        onSelect={() => onSelect(id)}
        onOpen={() => onOpen(id)}
        initialPosition={getInitialPosition(index, arrange, size)}
      />
    );
  });
};

DesktopIconGrid.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  arrange: PropTypes.oneOf(['columns', 'rows']),
  iconSize: PropTypes.oneOf(DESKTOP_ICON_SIZE_IDS),
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default DesktopIconGrid;
