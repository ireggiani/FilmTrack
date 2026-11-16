import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import LookupList from './LookupList';
import WindowIcon from '../ui/WindowIcon';

// A manager window: the frame, an add/edit form and the list, for the lookup
// it's given (lookups.js). What only one theme has comes in from its own file:
// `formToggle` draws a title-bar button that shows and hides the form,
// `underlay` goes behind everything, and `onDrag` follows the window's drags.
const LookupWindow = ({
  lookup,
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  icon,
  formToggle,
  underlay,
  onDrag,
}) => {
  const { theme } = lookup;
  const nodeRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [formShown, setFormShown] = useState(true);

  if (!isOpen) return null;

  const button = (name, active) =>
    `titlebar-button${name ? ` ${name}` : ''}${theme.button}${
      theme.markActive && active ? ' active' : ''
    }`;

  // Editing needs the form, so a hidden one comes back
  const startEdit = (item) => {
    setEditing(item);
    setFormShown(true);
  };

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      disabled={isMaximized}
      cancel=".titlebar-button"
      onDrag={onDrag}
    >
      <div
        ref={nodeRef}
        className={`${theme.window}${isMaximized ? ' maximized' : ''}`}
        onClick={onFocus}
        style={{
          ...(isMaximized
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 32px)',
                maxHeight: 'calc(100vh - 32px)',
                borderRadius: 0,
                zIndex: 300,
              }
            : { zIndex }),
          ...(isMinimized ? { display: 'none' } : {}),
        }}
      >
        {underlay}
        <div className={theme.titlebar}>
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt={lookup.title} />
            </span>
            {/* One string: split in two, the browser spaces the words differently */}
            <span className="window-title">{`${lookup.title} Manager`}</span>
          </div>
          <div className="titlebar-right">
            {formToggle?.({ shown: formShown, toggle: () => setFormShown(!formShown) })}
            <button className={button('window-minimize')} onClick={onMinimize} title="Minimize">
              🗕
            </button>
            <button
              className={button('window-maximize', isMaximized)}
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button className={button('window-close')} onClick={onClose}>
              🗙
            </button>
          </div>
        </div>
        <div
          className="window-content"
          style={
            isMaximized
              ? { maxHeight: 'calc(100vh - 64px)', height: 'calc(100vh - 64px)' }
              : {}
          }
        >
          <theme.Form
            lookup={lookup}
            editing={editing}
            onDone={() => setEditing(null)}
            hidden={!formShown}
          />
          <LookupList lookup={lookup} onEdit={startEdit} />
        </div>
      </div>
    </Draggable>
  );
};

LookupWindow.propTypes = {
  lookup: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
  formToggle: PropTypes.func,
  underlay: PropTypes.node,
  onDrag: PropTypes.func,
};

export default LookupWindow;
