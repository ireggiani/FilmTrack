import { useState, useRef } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import MoviesTable from "./MoviesTable";
import "../../styles/movies/_movies-table.scss";

const MoviesWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onMoviesLoaded,
  refreshMovies,
  setRefreshMovies,
  onFocus,
  zIndex,
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
        className={isMaximized ? "window maximized" : "window"}
        onClick={onFocus}
        style={{
          ...(isMaximized
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "calc(100vh - 32px)",
                maxHeight: "calc(100vh - 32px)",
                borderRadius: 0,
                zIndex: 300,
              }
            : {
                zIndex,
                width: "90vw",
                maxWidth: "1200px",
              }),
          ...(isMinimized
            ? {
                display: "none",
              }
            : {}),
        }}
      >
        <div className="window-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              onDoubleClick={onClose}
              style={{
                cursor: "pointer",
                fontSize: "1rem",
                userSelect: "none",
              }}
              title="Double-click to close"
            >
              🎬
            </span>
            <span>Movies Collection</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="titlebar-button"
              onClick={() => setHideAddForm(!hideAddForm)}
              title="Toggle add movie form"
              style={{ marginRight: "5px" }}
            >
              ➕
            </button>
            <button
              className="titlebar-button"
              onClick={() => setRefreshMovies((prev) => prev + 1)}
              title="Refresh data"
              style={{ marginRight: "5px" }}
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
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "🗗" : "🗖"}
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>
        <div
          className="window-content"
          style={{
            overflow: "visible",
            padding: "1rem 0.5rem 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            ...(isMaximized
              ? {
                  maxHeight: "calc(100vh - 64px)",
                  height: "calc(100vh - 64px)",
                }
              : {}),
          }}
        >
          <MoviesTable
            refresh={refreshMovies}
            onMoviesLoaded={onMoviesLoaded}
            hideAddForm={hideAddForm}
          />
        </div>
      </div>
    </Draggable>
  );
};

MoviesWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  movies: PropTypes.array,
  onMoviesLoaded: PropTypes.func,
  refreshMovies: PropTypes.number,
  setRefreshMovies: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default MoviesWindow;
