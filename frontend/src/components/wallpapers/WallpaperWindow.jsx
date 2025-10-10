import { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";

const WallpaperWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  currentWallpaper,
  onWallpaperChange,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [wallpaperMode, setWallpaperMode] = useState("cover");

  useEffect(() => {
    const savedMode = localStorage.getItem("filmtrack-wallpaper-mode");
    if (savedMode) {
      setWallpaperMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (currentWallpaper) {
      if (wallpaperMode === "tile") {
        document.body.style.backgroundSize = "auto";
        document.body.style.backgroundRepeat = "repeat";
      } else {
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
      }
    }
  }, [wallpaperMode, currentWallpaper]);

  const handleModeChange = (mode) => {
    setWallpaperMode(mode);
    localStorage.setItem("filmtrack-wallpaper-mode", mode);
  };

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onWallpaperChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearWallpaper = () => {
    onWallpaperChange(null);
  };

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="glass-window"
        onClick={onFocus}
        style={{
          width: "350px",
          zIndex,
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
              🎨
            </span>
            <span>Wallpaper Settings</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>
        <div className="window-content">
          {currentWallpaper && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "white",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                }}
              >
                Current Wallpaper:
              </label>
              <img
                src={currentWallpaper}
                alt="Current wallpaper"
                style={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "0.5rem",
                fontWeight: 500,
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
              }}
            >
              Display Mode:
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                }}
              >
                <input
                  type="radio"
                  name="wallpaperMode"
                  value="cover"
                  checked={wallpaperMode === "cover"}
                  onChange={(e) => handleModeChange(e.target.value)}
                  style={{ marginRight: "0.5rem" }}
                />
                Cover
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                }}
              >
                <input
                  type="radio"
                  name="wallpaperMode"
                  value="tile"
                  checked={wallpaperMode === "tile"}
                  onChange={(e) => handleModeChange(e.target.value)}
                  style={{ marginRight: "0.5rem" }}
                />
                Tile
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1 }}
            >
              Select New
            </button>

            <button
              className="btn btn-primary"
              onClick={clearWallpaper}
              style={{ flex: 1 }}
            >
              Remove
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default WallpaperWindow;
