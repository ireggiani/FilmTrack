import { useState, useRef, useCallback } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import CountryForm from "./CountryForm";
import CountryList from "./CountryList";
import "../../styles/countries/_country-form.scss";
import "../../styles/countries/_country-list.scss";
import WindowIcon from "../ui/WindowIcon";

const CountryWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  countries,
  onCountryAdded,
  onCountriesLoaded,
  refreshCountries,
  onFocus,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const [editingCountry, setEditingCountry] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);

  const handleEditComplete = useCallback(() => {
    setEditingCountry(null);
    onCountryAdded(); // Refresh the list
  }, [onCountryAdded]);

  const handleCountryDelete = useCallback(
    async (countryId) => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/countries/${countryId}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          onCountryAdded(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting country:", error);
      }
    },
    [onCountryAdded],
  );

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
        className={isMaximized ? "window--paper maximized" : "window--paper"}
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
        <div className="window-titlebar leather">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Countries" />
            </span>
            <span>Countries Manager</span>
          </div>
          <div className="titlebar-right">
            <button
              className={`titlebar-button rubber ${
                !showAddForm ? "active" : ""
              }`}
              onClick={() => setShowAddForm(!showAddForm)}
              title={showAddForm ? "Hide Add Form" : "Show Add Form"}
            >
              +
            </button>
            <button
              className="titlebar-button window-minimize rubber"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className={`titlebar-button window-maximize rubber ${
                isMaximized ? "active" : ""
              }`}
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "🗗" : "🗖"}
            </button>
            <button
              className="titlebar-button window-close rubber"
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
                  maxHeight: "calc(100vh - 64px)",
                  height: "calc(100vh - 64px)",
                }
              : {}
          }
        >
          {showAddForm && (
            <>
              <CountryForm
                onCountryAdded={onCountryAdded}
                existingCountries={countries}
                editingCountry={editingCountry}
                onEditComplete={handleEditComplete}
              />
              <hr className="paper" />
            </>
          )}
          <CountryList
            refresh={refreshCountries}
            onCountriesLoaded={onCountriesLoaded}
            onCountryEdit={setEditingCountry}
            onCountryDelete={handleCountryDelete}
          />
        </div>
      </div>
    </Draggable>
  );
};

CountryWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      flagEmoji: PropTypes.string,
    }),
  ),
  onCountryAdded: PropTypes.func,
  onCountriesLoaded: PropTypes.func,
  refreshCountries: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default CountryWindow;
