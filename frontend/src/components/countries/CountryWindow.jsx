import { useState, useRef } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import CountryForm from "./CountryForm";
import CountryList from "./CountryList";

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
}) => {
  const nodeRef = useRef(null);
  const [editingCountry, setEditingCountry] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleEditComplete = () => {
    setEditingCountry(null);
    onCountryAdded(); // Refresh the list
  };

  const handleCountryDelete = async (countryId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/countries/${countryId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        onCountryAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting country:", error);
    }
  };

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      disabled={isMaximized}
    >
      <div
        ref={nodeRef}
        className={isMaximized ? "glass-window maximized" : "glass-window"}
        onClick={onFocus}
        style={{
          ...(isMaximized ? {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "calc(100vh - 32px)",
            maxHeight: "calc(100vh - 32px)",
            borderRadius: 0,
            zIndex: 300,
          } : { zIndex }),
          ...(isMinimized ? {
            display: 'none'
          } : {})
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
              🌍
            </span>
            <span>Countries Manager</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className="window-maximize"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "🗗" : "🗖"}
            </button>
            <button className="window-close" onClick={onClose}>
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
          <CountryForm
            onCountryAdded={onCountryAdded}
            existingCountries={countries}
            editingCountry={editingCountry}
            onEditComplete={handleEditComplete}
          />
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
    })
  ),
  onCountryAdded: PropTypes.func,
  onCountriesLoaded: PropTypes.func,
  refreshCountries: PropTypes.number,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
};

export default CountryWindow;