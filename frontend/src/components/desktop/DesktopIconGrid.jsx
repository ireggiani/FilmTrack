import PropTypes from 'prop-types';
import { DESKTOP_ICON_IDS, WINDOW_MAP } from '../../config/windowRegistry';
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
 * Renders every icon listed in DESKTOP_ICON_IDS.
 * To expose a new window as a desktop icon, add its id to that array in
 * windowRegistry.js — no changes are needed here.
 */
const DesktopIconGrid = ({ selectedId, onSelect, onOpen }) => (
  <>
    {DESKTOP_ICON_IDS.map((id, index) => {
      const { icon, title } = WINDOW_MAP[id];
      return (
        <DesktopIcon
          key={id}
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
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default DesktopIconGrid;
