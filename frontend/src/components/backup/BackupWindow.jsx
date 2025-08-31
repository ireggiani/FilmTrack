import React, { useState, useRef } from "react";
import Draggable from "react-draggable";

const BackupWindow = ({
  isVisible,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleBackup = async () => {
    try {
      setMessage("Starting backup...");
      const response = await fetch("http://localhost:5000/api/database/backup");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Backup failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database.backup.sqlite";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Backup downloaded successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(`File selected: ${selectedFile.name}`);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      setMessage("Please select a file to restore.");
      return;
    }

    const formData = new FormData();
    formData.append("db-file", file);

    try {
      setMessage("Restoring database... This may take a moment.");
      const response = await fetch(
        "http://localhost:5000/api/database/restore",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.text();
      setMessage(result);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Draggable handle=".window-titlebar" onStart={onFocus} nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className="glass-window backup-window" 
        style={{ width: "350px", height: "400px", zIndex, ...(isMinimized && { display: 'none' }) }}
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
              🎨
            </span>
            <span>Backup & Restore</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button className="window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>
        <div className="window-content">
          <div className="backup-section" style={{ marginBottom: "15px" }}>
            <p>Download a copy of the current database.</p>
            <button className="btn btn-primary" onClick={handleBackup}>
              Backup Database
            </button>
          </div>
          <div className="restore-section">
            <p>Restore the database from a backup file.</p>
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current.click()}
            >
              Select File
            </button>
            <button
              className="btn btn-primary"
              onClick={handleRestore}
              disabled={!file}
            >
              Restore Database
            </button>
          </div>
          {message && (
            <p
              className="message"
              style={{ marginTop: "15px", textAlign: "center" }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default BackupWindow;
