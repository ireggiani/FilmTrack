import { useState, useRef } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import GenreForm from "./GenreForm";
import GenreList from "./GenreList";

const GenreWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  genres,
  onGenreAdded,
  onGenresLoaded,
  refreshGenres,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const [editingGenre, setEditingGenre] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleEditComplete = () => {
    setEditingGenre(null);
    onGenreAdded(); // Refresh the list
  };

  const handleGenreDelete = async (genreId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/genres/${genreId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        onGenreAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting genre:", error);
    }
  };

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
            : { zIndex }),
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
              🎭
            </span>
            <span>Genres Manager</span>
          </div>
          <div style={{ display: "flex" }}>
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
          style={
            isMaximized
              ? {
                  maxHeight: "calc(100vh - 64px)",
                  height: "calc(100vh - 64px)",
                }
              : {}
          }
        >
          <GenreForm
            onGenreAdded={onGenreAdded}
            existingGenres={genres}
            editingGenre={editingGenre}
            onEditComplete={handleEditComplete}
          />
          <GenreList
            refresh={refreshGenres}
            onGenresLoaded={onGenresLoaded}
            onGenreEdit={setEditingGenre}
            onGenreDelete={handleGenreDelete}
          />
        </div>
      </div>
    </Draggable>
  );
};

GenreWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  genres: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  onGenreAdded: PropTypes.func,
  onGenresLoaded: PropTypes.func,
  refreshGenres: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default GenreWindow;
