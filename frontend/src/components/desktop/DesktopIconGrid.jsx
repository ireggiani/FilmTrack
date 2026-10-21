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

/** Maps a flat list index to a (col, row) grid position. */
const getInitialPosition = (index) => ({
  x: GRID.padX + Math.floor(index / GRID.perCol) * GRID.cellW,
  y: GRID.padY + (index % GRID.perCol) * GRID.cellH,
});

/**
 * Renders the given desktop icons (ids from the window registry), in order.
 * The key includes the slot index so that adding or removing an icon re-lays
 * every icon out on the grid, instead of leaving gaps or stacking a new icon
 * on top of one that kept its old slot. (Dragged positions aren't persisted
 * yet, so nothing is lost.)
 */
const DesktopIconGrid = ({ ids, selectedId, onSelect, onOpen }) => (
  <>
    {ids.map((id, index) => {
      const { icon, title } = WINDOW_MAP[id];
      return (
        <DesktopIcon
          key={`${id}@${index}`}
          icon={icon}
          label={title}
          isSelected={selectedId === id}
          onSelect={() => onSelect(id)}
          onOpen={() => onOpen(id)}
          initialPosition={getInitialPosition(index)}
        />
      );
    })}
  </>
);

DesktopIconGrid.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default DesktopIconGrid;
