import { useRef } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import WindowIcon from '../ui/WindowIcon';
import {
  START_MENU_WINDOWS,
  START_MENU_FOLDERS,
  DEFAULT_DESKTOP_ICON_IDS,
} from '../../config/windowRegistry';
import '../../styles/desktop/_desktop-icons-window.scss';

// Same sections as the Start menu: its folders in the left column, the
// programs outside any folder in the right one
const folderIds = START_MENU_FOLDERS.flatMap((folder) => folder.ids);
const COLUMNS = [
  START_MENU_FOLDERS.map((folder) => ({
    name: folder.name,
    // Alphabetical, like the Start menu's folders
    windows: START_MENU_WINDOWS.filter((w) => folder.ids.includes(w.id)).sort(
      (a, b) => a.title.localeCompare(b.title)
    ),
  })),
  [
    {
      name: 'Programs',
      windows: START_MENU_WINDOWS.filter((w) => !folderIds.includes(w.id)),
    },
  ],
].map((sections) => sections.filter((section) => section.windows.length > 0));

const sameIds = (a, b) => a.length === b.length && a.every((id, i) => id === b[i]);

// Choose which Start menu entries also appear as desktop icons. Changes apply
// immediately, like Wallpaper Settings; newly ticked icons join the end.
const DesktopIconsWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  icon,
  selectedIds,
  onChange,
}) => {
  const nodeRef = useRef(null);

  if (!isOpen) return null;

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id]
    );

  const count = selectedIds.length;

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window desktop-icons-window"
        onClick={onFocus}
        style={{ zIndex, ...(isMinimized ? { display: 'none' } : {}) }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Desktop Icons" />
            </span>
            <span className="window-title">Desktop Icons</span>
          </div>
          <div className="titlebar-right">
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>

        <div className="window-content desktop-icons-content">
          <p className="desktop-icons-intro">
            Tick the programs you want as icons on the desktop.
          </p>

          <div className="desktop-icons-list">
            {COLUMNS.map((sections, column) => (
              <div key={column}>
                {sections.map((section) => (
                  <section key={section.name}>
                    <h3 className="desktop-icons-group">{section.name}</h3>
                    <ul>
                      {section.windows.map((w) => (
                        <li key={w.id}>
                          <label className="desktop-icons-item">
                            <input
                              type="checkbox"
                              className="aero-check"
                              checked={selectedIds.includes(w.id)}
                              onChange={() => toggle(w.id)}
                            />
                            <WindowIcon
                              icon={w.icon}
                              alt=""
                              className="desktop-icons-item-icon"
                            />
                            <span>{w.title}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ))}
          </div>

          <div className="desktop-icons-footer">
            <span className="desktop-icons-count">
              {count === 0
                ? 'No icons on the desktop'
                : `${count} icon${count === 1 ? '' : 's'} on the desktop`}
            </span>
            <button
              type="button"
              className="aero-push-btn"
              onClick={() => onChange(DEFAULT_DESKTOP_ICON_IDS)}
              disabled={sameIds(selectedIds, DEFAULT_DESKTOP_ICON_IDS)}
            >
              Restore Defaults
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

DesktopIconsWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DesktopIconsWindow;
