import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import API_BASE_URL from "../../config/api.js";
import "../../styles/backup/_backup-window.scss";

const BackupWindow = ({
  isOpen,
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
  const [csvColumns, setCsvColumns] = useState({
    title: true,
    alternativeTitle: true,
    releaseYear: true,
    rating: true,
    genres: true,
    directors: true,
    actors: true,
    countries: true,
  });

  const handleBackup = async () => {
    try {
      setMessage("Starting backup...");
      const response = await fetch(`${API_BASE_URL}/database/backup`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Backup failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "filmtrack.backup.sqlite";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("☑️ Backup downloaded successfully. ");
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
      setMessage("Select a file to restore.");
      return;
    }

    const formData = new FormData();
    formData.append("db-file", file);

    try {
      setMessage("Restoring database... This may take a moment.");
      const response = await fetch(`${API_BASE_URL}/database/restore`, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      setMessage(result);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCsvExport = async () => {
    try {
      setMessage("Generating CSV export...");
      const response = await fetch(`${API_BASE_URL}/movies`);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const movies = await response.json();
      movies.sort((a, b) => a.title.localeCompare(b.title));
      const selectedColumns = Object.keys(csvColumns).filter(
        (col) => csvColumns[col]
      );

      const headers = selectedColumns.map((col) => {
        switch (col) {
          case "alternativeTitle":
            return "Alternative Title";
          case "releaseYear":
            return "Release Year";
          default:
            return col.charAt(0).toUpperCase() + col.slice(1);
        }
      });

      const csvRows = [headers.join(",")];
      movies.forEach((movie) => {
        const row = selectedColumns.map((col) => {
          let value = "";
          switch (col) {
            case "genres":
              value = movie.Genres?.map((g) => g.name).join("; ") || "";
              break;
            case "directors":
              value = movie.Directors?.map((d) => d.name).join("; ") || "";
              break;
            case "actors":
              value = movie.Actors?.map((a) => a.name).join("; ") || "";
              break;
            case "countries":
              value = movie.Countries?.map((c) => c.name).join("; ") || "";
              break;
            default:
              value = movie[col] || "";
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "movies-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("CSV export downloaded successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleColumnToggle = (column) => {
    setCsvColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Draggable
      handle=".window-titlebar"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window backup-window"
        onClick={onFocus}
        style={{
          zIndex,
          ...(isMinimized && { display: "none" }),
        }}
      >
        <div className="window-titlebar important">
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
              💾
            </span>
            <span>Backup & Restore</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="titlebar-button window-minimize orb"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className="titlebar-button window-close orb"
              onClick={onClose}
            >
              🗙
            </button>
          </div>
        </div>
        <div className="window-content">
          <section className="backup-section">
            <p>
              Here you can download a backup copy of the current database, as a
              SQLite file.
            </p>
            <button className="btn" onClick={handleBackup}>
              💽 Backup Database
            </button>
          </section>
          <section className="restore-section">
            <p>
              Restore the database from a previously saved backup SQLite file.
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <div className="btn-group">
              <button
                className="btn"
                onClick={() => fileInputRef.current.click()}
              >
                Select File
              </button>
              <button className="btn" onClick={handleRestore} disabled={!file}>
                🧰 Restore Database
              </button>
            </div>
          </section>

          <section className="export-section" style={{ marginBottom: "15px" }}>
            <div className="cta">
              <p>Export movies data as CSV file:</p>
              <button className="btn" onClick={handleCsvExport}>
                📊 Export CSV
              </button>
            </div>
            <fieldset>
              <legend>Select columns to include:</legend>
              {Object.entries(csvColumns).map(([col, checked]) => (
                <label key={col}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleColumnToggle(col)}
                  />
                  {col === "alternativeTitle"
                    ? "Alternative Title"
                    : col === "releaseYear"
                    ? "Release Year"
                    : col.charAt(0).toUpperCase() + col.slice(1)}
                </label>
              ))}
            </fieldset>
          </section>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </Draggable>
  );
};

export default BackupWindow;
