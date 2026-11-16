import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import MoviesTable from '../movies/MoviesTable';
import { SERIES_KIND } from '../movies/kinds';
import WindowIcon from '../ui/WindowIcon';
import { reloadLists } from '../../services/lists.js';
import '../../styles/movies/_movies-table.scss';
import '../../styles/series/_series-window.scss';

// TV series, mini-series and anime: the Movies Collection's add form and
// table (see ../movies/kinds.js) in an Aqua window, over its own list
const SeriesWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  onViewPoster,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hideAddForm, setHideAddForm] = useState(false);

  if (!isOpen) return null;

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      disabled={isMaximized}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className={`series-window window${isMaximized ? ' maximized' : ''}`}
        onClick={onFocus}
        style={{
          // Maximized sits above every window, like Movies and the Poster Viewer
          zIndex: isMaximized ? 300 : zIndex,
          ...(isMinimized ? { display: 'none' } : {}),
        }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Series" />
            </span>
            <span className="window-title">Series Collection</span>
          </div>
          <div className="titlebar-right">
            <button
              className="titlebar-button"
              onClick={() => setHideAddForm(!hideAddForm)}
              title="Toggle add series form"
            >
              ➕
            </button>
            <button
              className="titlebar-button"
              onClick={reloadLists}
              title="Refresh data"
            >
              🔄
            </button>
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className="titlebar-button window-maximize"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button
              className="titlebar-button window-close"
              onClick={onClose}
              title="Close"
            >
              🗙
            </button>
          </div>
        </div>
        <div className="window-content">
          <MoviesTable
            kind={SERIES_KIND}
            hideAddForm={hideAddForm}
            onViewPoster={onViewPoster}
          />
        </div>
      </div>
    </Draggable>
  );
};

SeriesWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  onViewPoster: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
};

export default SeriesWindow;
