import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const MultiSelectDropdown = ({ options, selectedIds, onChange, placeholder, displayKey = 'name' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionId) => {
    const newSelectedIds = selectedIds.includes(optionId)
      ? selectedIds.filter(id => id !== optionId)
      : [...selectedIds, optionId];
    onChange(newSelectedIds);
  };

  const selectedOptions = options.filter(option => selectedIds.includes(option.id));
  const displayText = selectedOptions.length > 0 
    ? selectedOptions.map(opt => opt[displayKey]).join(', ')
    : placeholder;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          color: "white",
          padding: "0.25rem",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          fontSize: "0.8rem",
          minHeight: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <span style={{ 
          overflow: "hidden", 
          textOverflow: "ellipsis", 
          whiteSpace: "nowrap",
          flex: 1,
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)"
        }}>
          {displayText}
        </span>
        <span style={{ marginLeft: "0.5rem" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          maxHeight: "200px",
          overflowY: "auto",
          zIndex: 9999,
          backdropFilter: "blur(10px)"
        }}>
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleToggleOption(option.id)}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                color: "white",
                fontSize: "0.8rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                background: selectedIds.includes(option.id) 
                  ? "rgba(100, 150, 255, 0.3)" 
                  : "transparent",
                textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={(e) => {
                if (!selectedIds.includes(option.id)) {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.includes(option.id)) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <span style={{
                width: "16px",
                height: "16px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selectedIds.includes(option.id) 
                  ? "rgba(100, 150, 255, 0.5)" 
                  : "transparent"
              }}>
                {selectedIds.includes(option.id) && "✓"}
              </span>
              <span>
                {option.flagEmoji && `${option.flagEmoji} `}{option[displayKey]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  options: PropTypes.array.isRequired,
  selectedIds: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  displayKey: PropTypes.string
};

export default MultiSelectDropdown;