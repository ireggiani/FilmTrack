import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import WindowIcon from '../ui/WindowIcon';
import { WINDOW_MAP } from '../../config/windowRegistry';
import { DESKTOP_ICON_SIZES, DESKTOP_ICON_SIZE_IDS } from '../../config/desktopIconSizes';
import '../../styles/desktop/_context-menu.scss';

const EDGE = 6; // px kept clear of the viewport edges

const SORT_OPTIONS = [
  ['default', 'Default order'],
  ['az', 'Name A–Z'],
  ['za', 'Name Z–A'],
];

// Show Desktop has no window of its own, so it gets a small drawn icon:
// a glass screen with an empty taskbar
const ShowDesktopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <rect x="1.5" y="2.5" width="13" height="10" rx="1.5" fill="rgba(127, 233, 245, 0.25)" stroke="#dff8fb" />
    <rect x="2" y="10" width="12" height="2" fill="#dff8fb" fillOpacity="0.7" />
    <rect x="5" y="13" width="6" height="1.5" rx="0.75" fill="#dff8fb" />
  </svg>
);

const ARRANGE_OPTIONS = [
  ['columns', 'Columns'],
  ['rows', 'Rows'],
];

const ICON_SIZE_OPTIONS = DESKTOP_ICON_SIZES.map(({ id, label }) => [id, label]);

// Right-click menu for the desktop: smoked glass with a rim light and a
// one-time shine sweep on open. Flat — check marks instead of submenus.
// Closes on any outside mousedown, Esc, window blur/resize, or after an item
// is chosen. Arrow keys, Home and End move between items.
const DesktopContextMenu = ({
  x,
  y,
  sort,
  arrange,
  iconSize,
  onSortChange,
  onArrangeChange,
  onIconSizeChange,
  onNewNote,
  onNewMovie,
  onShowDesktop,
  onOpenWindow,
  onClose,
}) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Flip left/up when the menu would run off the right/bottom edge
  useLayoutEffect(() => {
    const { width, height } = menuRef.current.getBoundingClientRect();
    setPos({
      left: x + width > window.innerWidth - EDGE ? Math.max(EDGE, x - width) : x,
      top: y + height > window.innerHeight - EDGE ? Math.max(EDGE, y - height) : y,
    });
  }, [x, y]);

  useEffect(() => {
    menuRef.current?.focus();
    const onMouseDown = (e) => {
      if (!menuRef.current?.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    // Capture phase, so a click that something else stops still closes the menu
    window.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onClose);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const handleKeyDown = (e) => {
    const items = [...menuRef.current.querySelectorAll('[role^="menuitem"]')];
    const current = items.indexOf(document.activeElement);
    const moves = {
      ArrowDown: (current + 1) % items.length,
      ArrowUp: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      items[moves[e.key]].focus();
    }
  };

  // Every choice closes the menu, like a native one
  const choose = (action) => () => {
    action();
    onClose();
  };

  // icon: a window id (uses that window's icon) or a ready element
  const command = (label, icon, action) => (
    <button
      type="button"
      role="menuitem"
      className="desktop-menu-item"
      tabIndex={-1}
      onClick={choose(action)}
    >
      <span className="desktop-menu-lead">
        {typeof icon === 'string' ? <WindowIcon icon={WINDOW_MAP[icon].icon} alt="" /> : icon}
      </span>
      {label}
    </button>
  );

  const checkGroup = (label, options, value, onChange) => (
    <div role="group" aria-label={label}>
      <div className="desktop-menu-label">{label}</div>
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          role="menuitemradio"
          aria-checked={value === optionValue}
          className="desktop-menu-item"
          tabIndex={-1}
          onClick={choose(() => onChange(optionValue))}
        >
          <span className="desktop-menu-lead">
            {value === optionValue && <span className="desktop-menu-check" />}
          </span>
          {optionLabel}
        </button>
      ))}
    </div>
  );

  const separator = <div className="desktop-menu-separator" role="separator" />;

  return createPortal(
    <div
      ref={menuRef}
      className="desktop-menu"
      role="menu"
      aria-label="Desktop"
      tabIndex={-1}
      style={pos}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {command('Show Desktop', <ShowDesktopIcon />, onShowDesktop)}
      {separator}
      {command('New Note', 'notepad', onNewNote)}
      {command('New Movie', 'movies', onNewMovie)}
      {separator}
      {checkGroup('Icon size', ICON_SIZE_OPTIONS, iconSize, onIconSizeChange)}
      {separator}
      {checkGroup('Sort icons by', SORT_OPTIONS, sort, onSortChange)}
      {separator}
      {checkGroup('Arrange icons in', ARRANGE_OPTIONS, arrange, onArrangeChange)}
      {separator}
      {command('Desktop Icons…', 'desktopIcons', () => onOpenWindow('desktopIcons'))}
      {command('Wallpaper Settings…', 'wallpaper', () => onOpenWindow('wallpaper'))}
      {separator}
      {command('Help', 'help', () => onOpenWindow('help'))}
    </div>,
    document.body
  );
};

DesktopContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  sort: PropTypes.oneOf(['default', 'az', 'za']).isRequired,
  arrange: PropTypes.oneOf(['columns', 'rows']).isRequired,
  iconSize: PropTypes.oneOf(DESKTOP_ICON_SIZE_IDS).isRequired,
  onSortChange: PropTypes.func.isRequired,
  onArrangeChange: PropTypes.func.isRequired,
  onIconSizeChange: PropTypes.func.isRequired,
  onNewNote: PropTypes.func.isRequired,
  onNewMovie: PropTypes.func.isRequired,
  onShowDesktop: PropTypes.func.isRequired,
  onOpenWindow: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DesktopContextMenu;
