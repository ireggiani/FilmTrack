import { useState, useRef } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import DirectorForm from "./DirectorForm";
import DirectorList from "./DirectorList";

import "../../styles/directors/_director-form.scss";
import "../../styles/directors/_director-list.scss";

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
}) => {
  const nodeRef = useRef(null);
  const [editingDirector, setEditingDirector] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hideDirectorForm, setHideDirectorForm] = useState(false);

  if (!isOpen) return null;

  const handleEditComplete = () => {
    setEditingDirector(null);
    onDirectorAdded(); // Refresh the list
  };

  const handleDirectorDelete = async (directorId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/directors/${directorId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        onDirectorAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting director:", error);
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
        className={isMaximized ? "window--solid maximized" : "window--solid"}
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
        <div className="window-titlebar metal">
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
            <span>Directors Manager</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className={`titlebar-button paddle-switch${
                hideDirectorForm ? " active" : ""
              }`}
              onClick={() => setHideDirectorForm(!hideDirectorForm)}
              title="Toggle add director form"
            >
              +
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
                isMaximized ? " active" : ""
              }`}
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "🗗" : "🗖"}
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
          className="window-content--compact"
          style={
            isMaximized
              ? {
                  maxHeight: "calc(100vh - 64px)",
                  height: "calc(100vh - 64px)",
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
    })
  ),
  onDirectorAdded: PropTypes.func,
  onDirectorsLoaded: PropTypes.func,
  refreshDirectors: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default DirectorWindow;
