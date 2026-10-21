import React, { useEffect, useRef } from "react";
import WindowIcon from "./WindowIcon";
import { START_MENU_FOLDERS as FOLDERS } from "../../config/windowRegistry";

const FOLDER_IDS = FOLDERS.flatMap((folder) => folder.ids);

const StartMenu = ({ onSelect, onClose, windows }) => {
  const menuRef = useRef(null);

  const mainWindows = windows.filter((w) => !FOLDER_IDS.includes(w.id));

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
          {FOLDERS.map((folder) => {
            const folderWindows = windows.filter((w) => folder.ids.includes(w.id));
            if (folderWindows.length === 0) return null;
            return (
              <li key={folder.name} className="submenu">
                📁 {folder.name}
                <ul className="submenu-items">
                  {folderWindows.map((window) => (
                    <li key={window.id} onClick={() => onSelect(window.id)}>
                      <WindowIcon icon={window.icon} alt={window.title} />
                      {window.title}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
          {mainWindows.map((window) => (
            <li key={window.id} onClick={() => onSelect(window.id)}>
              <WindowIcon icon={window.icon} alt={window.title} />
              {window.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StartMenu;
