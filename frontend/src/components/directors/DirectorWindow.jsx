import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import DirectorForm from './DirectorForm';
import DirectorList from './DirectorList';

import '../../styles/directors/_director-form.scss';
import '../../styles/directors/_director-list.scss';

import WindowIcon from '../ui/WindowIcon';

// Horizontal repeat of the metal sheen (700px bands at 80deg in _metal.scss)
const SHEEN_PERIOD = 700 / Math.sin((80 * Math.PI) / 180);

const DirectorWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  directors,
  onDirectorAdded,
  onDirectorsLoaded,
  refreshDirectors,
  onFocus,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const sheenRef = useRef(null);
  const [editingDirector, setEditingDirector] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hideDirectorForm, setHideDirectorForm] = useState(false);

  if (!isOpen) return null;

  // Drift the metal's sheen against the drag, so the light seems to stay put
  // while the window moves. Set directly on the sheen element's transform: no
  // React state (no re-render), and not a CSS variable on the window (those
  // inherit, so every element inside would get its style recalculated on
  // each mouse move). Only this layer is recomposited.
  //
  // The offset wraps within one horizontal period of the sheen's repeating
  // pattern (700px bands at 80° → 700 / sin 80° ≈ 711px across), which looks
  // identical, so the layer never slides far enough to show its edge.
  const handleDrag = (_e, data) => {
    if (sheenRef.current) {
      const shift = (((data.x * 0.6) % SHEEN_PERIOD) + SHEEN_PERIOD) % SHEEN_PERIOD;
      sheenRef.current.style.transform = `translateX(${-shift}px)`;
    }
  };

  const handleEditComplete = () => {
    setEditingDirector(null);
    onDirectorAdded(); // Refresh the list
  };

  const handleDirectorDelete = async (directorId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/directors/${directorId}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        onDirectorAdded(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting director:', error);
    }
  };

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      disabled={isMaximized}
      cancel=".titlebar-button"
      onDrag={handleDrag}
    >
      <div
        ref={nodeRef}
        className={isMaximized ? 'window--metal maximized' : 'window--metal'}
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
          ...(isMinimized
            ? {
                display: 'none',
              }
            : {}),
        }}
      >
        <div ref={sheenRef} className="metal-sheen" aria-hidden="true" />
        <div className="window-titlebar metal">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Directors" />
            </span>
            <span className="window-title">Directors Manager</span>
          </div>
          <div className="titlebar-right">
            {/* Latched down with its LED lit while the form is shown */}
            <button
              className={`titlebar-button paddle-switch${
                hideDirectorForm ? '' : ' active'
              }`}
              onClick={() => setHideDirectorForm(!hideDirectorForm)}
              title={hideDirectorForm ? 'Show add director form' : 'Hide add director form'}
              aria-pressed={!hideDirectorForm}
            >
              +
              <span className={`led${hideDirectorForm ? '' : ' on'}`} aria-hidden="true" />
            </button>
            <button
              className="titlebar-button window-minimize paddle-switch"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className={`titlebar-button window-maximize paddle-switch ${
                isMaximized ? ' active' : ''
              }`}
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button
              className="titlebar-button window-close paddle-switch"
              onClick={onClose}
            >
              🗙
            </button>
          </div>
        </div>
        <div
          className="window-content"
          style={
            isMaximized
              ? {
                  maxHeight: 'calc(100vh - 64px)',
                  height: 'calc(100vh - 64px)',
                }
              : {}
          }
        >
          <DirectorForm
            onDirectorAdded={onDirectorAdded}
            existingDirectors={directors}
            editingDirector={editingDirector}
            onEditComplete={handleEditComplete}
            hideDirectorForm={hideDirectorForm}
          />
          <DirectorList
            refresh={refreshDirectors}
            onDirectorsLoaded={onDirectorsLoaded}
            onDirectorEdit={setEditingDirector}
            onDirectorDelete={handleDirectorDelete}
          />
        </div>
      </div>
    </Draggable>
  );
};

DirectorWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  directors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ),
  onDirectorAdded: PropTypes.func,
  onDirectorsLoaded: PropTypes.func,
  refreshDirectors: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default DirectorWindow;
