import { useState, useRef } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import ActorForm from "./ActorForm";
import ActorList from "./ActorList";

import "../../styles/actors/_actor-form.scss";
import "../../styles/actors/_actor-list.scss";

import WindowIcon from "../ui/WindowIcon";

const ActorWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  actors,
  onActorAdded,
  onActorsLoaded,
  refreshActors,
  onFocus,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const [editingActor, setEditingActor] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleEditComplete = () => {
    setEditingActor(null);
    onActorAdded(); // Refresh the list
  };

  const handleActorDelete = async (actorId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/actors/${actorId}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        onActorAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting actor:", error);
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
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Actors" />
            </span>
            <span>Actors Manager</span>
          </div>
          <div className="titlebar-right">
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
          <ActorForm
            onActorAdded={onActorAdded}
            existingActors={actors}
            editingActor={editingActor}
            onEditComplete={handleEditComplete}
          />
          <ActorList
            refresh={refreshActors}
            onActorsLoaded={onActorsLoaded}
            onActorEdit={setEditingActor}
            onActorDelete={handleActorDelete}
          />
        </div>
      </div>
    </Draggable>
  );
};

ActorWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  actors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ),
  onActorAdded: PropTypes.func,
  onActorsLoaded: PropTypes.func,
  refreshActors: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default ActorWindow;
