import PropTypes from 'prop-types';
import { WINDOW_MAP } from '../../config/windowRegistry';
import DesktopIcon from './DesktopIcon';

// Initial grid layout (pixels). Mirrors the CSS custom property defaults so
// icons start in the right positions. Adjust if --desktop-icon-* vars change.
const GRID = {
  padX:   16,  // left margin from the desktop edge
  padY:   16,  // top margin from the desktop edge
  cellW:  88,  // horizontal stride between columns
  cellH:  92,  // vertical stride between rows
  perCol:  8,  // icons per column before wrapping to the next column
};

// Icons per row in "rows" arrangement: as many as fit across the desktop
const perRow = () =>
  Math.max(1, Math.floor((window.innerWidth - GRID.padX * 2) / GRID.cellW));

/**
 * Maps a flat list index to a grid position: down each column first
 * ("columns"), or across each row first ("rows").
 */
const getInitialPosition = (index, arrange) => {
  const across = arrange === 'rows' ? perRow() : null;
  const col = across ? index % across : Math.floor(index / GRID.perCol);
  const row = across ? Math.floor(index / across) : index % GRID.perCol;
  return { x: GRID.padX + col * GRID.cellW, y: GRID.padY + row * GRID.cellH };
};

/**
 * Renders the given desktop icons (ids from the window registry), in order.
 * The key includes the slot index so that adding or removing an icon re-lays
 * every icon out on the grid, instead of leaving gaps or stacking a new icon
 * on top of one that kept its old slot. (Dragged positions aren't persisted
 * yet, so nothing is lost.)
 */
const DesktopIconGrid = ({ ids, arrange = 'columns', selectedId, onSelect, onOpen }) => (
  <>
    {ids.map((id, index) => {
      const { icon, title } = WINDOW_MAP[id];
      return (
        <DesktopIcon
          // Arrangement in the key too, so switching it re-lays out every icon
          key={`${id}@${index}-${arrange}`}
          icon={icon}
          label={title}
          isSelected={selectedId === id}
          onSelect={() => onSelect(id)}
          onOpen={() => onOpen(id)}
          initialPosition={getInitialPosition(index, arrange)}
        />
      );
    })}
  </>
);

DesktopIconGrid.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  arrange: PropTypes.oneOf(['columns', 'rows']),
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default DesktopIconGrid;
