import React, { useEffect, useRef } from 'react';

const StartMenu = ({ onSelect, onClose, windows }) => {
  const menuRef = useRef(null);
  
  const mainWindows = windows.filter(w => !['calculator', 'calendar', 'clock', 'notepad'].includes(w.id));
  const accessoryWindows = windows.filter(w => ['calculator', 'calendar', 'clock', 'notepad'].includes(w.id));

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is on the start button, do nothing.
      if (event.target.closest('.start-button-wrapper')) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu-inner">
        <ul>
          {mainWindows.map((window) => (
            <li key={window.id} onClick={() => onSelect(window.id)}>
              {window.title}
            </li>
          ))}
          {accessoryWindows.length > 0 && (
            <li className="submenu">
              📁 Accessories
              <ul className="submenu-items">
                {accessoryWindows.map((window) => (
                  <li key={window.id} onClick={() => onSelect(window.id)}>
                    {window.icon} {window.title}
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
