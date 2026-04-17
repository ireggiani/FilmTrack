import React, { useEffect, useRef } from "react";
import WindowIcon from "./WindowIcon";

const StartMenu = ({ onSelect, onClose, windows }) => {
  const menuRef = useRef(null);

  const mainWindows = windows.filter(
    (w) => !["calculator", "calendar", "clock", "notepad", "wallpaper", "backup"].includes(w.id),
  );
  const accessoryWindows = windows.filter((w) =>
    ["calculator", "calendar", "clock", "notepad"].includes(w.id),
  );
  const systemWindows = windows.filter((w) =>
    ["wallpaper", "backup"].includes(w.id),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is on the start button, do nothing.
      if (event.target.closest(".start-button-wrapper")) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu-inner">
        <ul>
          {mainWindows.map((window) => (
            <li key={window.id} onClick={() => onSelect(window.id)}>
              <WindowIcon icon={window.icon} alt={window.title} />
              {window.title}
            </li>
          ))}
          {systemWindows.length > 0 && (
            <li className="submenu">
              📁 System
              <ul className="submenu-items">
                {systemWindows.map((window) => (
                  <li key={window.id} onClick={() => onSelect(window.id)}>
                    <WindowIcon icon={window.icon} alt={window.title} />
                    {window.title}
                  </li>
                ))}
              </ul>
            </li>
          )}
          {accessoryWindows.length > 0 && (
            <li className="submenu">
              📁 Accessories
              <ul className="submenu-items">
                {accessoryWindows.map((window) => (
                  <li key={window.id} onClick={() => onSelect(window.id)}>
                    <WindowIcon icon={window.icon} alt={window.title} />
                    {window.title}
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StartMenu;
