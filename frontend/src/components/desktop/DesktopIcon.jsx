import { useRef } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';

/**
 * A single skeuomorphic desktop icon: PNG image + label.
 * - Single-click  → select (clears other selections via parent state)
 * - Double-click  → open the associated window
 * - Draggable     → confined to the desktop container via bounds="parent"
 *
 * Visual sizing is driven by CSS custom properties on the container
 * (--desktop-icon-size, --desktop-icon-font-size, --desktop-icon-width)
 * so a future Control Panel can adjust them without touching this file.
 */
const DesktopIcon = ({ icon, label, isSelected, onSelect, onOpen, initialPosition }) => {
  const nodeRef = useRef(null);

  // Accumulated drag distance since the last mousedown. Used to distinguish
  // a click (< DRAG_THRESHOLD px total movement) from a genuine drag.
  const totalMove = useRef(0);
  const DRAG_THRESHOLD = 5;

  const handleDragStart = () => {
    totalMove.current = 0;
  };

  const handleDrag = (_, { deltaX, deltaY }) => {
    totalMove.current += Math.abs(deltaX) + Math.abs(deltaY);
  };

  // onClick fires after every mouseup, including after drags. Suppress
  // selection when the user was dragging, then reset the accumulator.
  const handleClick = (e) => {
    e.stopPropagation(); // keep desktop's onClick from immediately deselecting
    if (totalMove.current < DRAG_THRESHOLD) onSelect();
    totalMove.current = 0;
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onOpen();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onOpen();
    if (e.key === ' ') { e.preventDefault(); onSelect(); }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={initialPosition}
      bounds="parent"
      onStart={handleDragStart}
      onDrag={handleDrag}
    >
      <div
        ref={nodeRef}
        className={`desktop-icon${isSelected ? ' desktop-icon--selected' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={isSelected}
      >
        <div className="desktop-icon__img-wrap">
          <img
            className="desktop-icon__img"
            src={icon}
            alt=""
            draggable={false}
          />
        </div>
        <span className="desktop-icon__label">{label}</span>
      </div>
    </Draggable>
  );
};

DesktopIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  initialPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

export default DesktopIcon;
