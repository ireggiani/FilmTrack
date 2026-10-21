import { useState } from "react";
import PropTypes from "prop-types";
import ConfirmDialog from "./ConfirmDialog";

const PillItem = ({ id, name, icon, itemType, onEdit, onDelete, className }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleEditClick = (e) => {
    e.target.blur();
    onEdit?.({ id, name, icon });
    // Assuming input focus logic is handled by the parent component after edit
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmingDelete(true);
  };

  return (
    <div className={`pill-item${className ? ` ${className}` : ""}`}>
      <button
        onClick={handleEditClick}
        className={`pill-edit-button ${icon ? "with-icon" : ""}`}
        title={`Edit ${name}`}
      >
        {icon && <span>{icon}</span>}
        <span>{name}</span>
      </button>
      <button
        onClick={handleDeleteClick}
        className="pill-delete-button"
        title={`Delete ${name}`}
      >
        ×
      </button>
      {confirmingDelete && (
        <ConfirmDialog
          title={itemType ? `Delete ${itemType}` : "Delete"}
          heading={`Delete “${name}”?`}
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmingDelete(false);
            onDelete?.(id);
          }}
          onCancel={() => setConfirmingDelete(false)}
        >
          It will be removed from every movie that has it. This can&apos;t be
          undone.
        </ConfirmDialog>
      )}
    </div>
  );
};

PillItem.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  // Shown in the delete dialog's title, e.g. "Genre"
  itemType: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

export default PillItem;
