import React from 'react';
import PropTypes from 'prop-types';

const PillItem = ({ id, name, icon, onEdit, onDelete }) => {
  const handleEditClick = (e) => {
    e.target.blur();
    onEdit?.({ id, name, icon });
    // Assuming input focus logic is handled by the parent component after edit
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${name}?`)) {
      onDelete?.(id);
    }
  };

  return (
    <div className="pill-item">
      <button
        onClick={handleEditClick}
        className={`pill-edit-button ${icon ? 'with-icon' : ''}`}
        title={`Edit ${name}`}
      >
        {icon && <span>{icon}</span>}
        <span>{name}</span>
      </button>
      <button
        onClick={handleDeleteClick}
        className="pill-delete-button"
        title={`Delete ${name}`}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255, 100, 100, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255, 100, 100, 0.3)";
        }}
      >
        ×
      </button>
    </div>
  );
};

PillItem.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default PillItem;
