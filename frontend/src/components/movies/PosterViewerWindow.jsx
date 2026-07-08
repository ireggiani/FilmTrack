import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import WindowIcon from "../ui/WindowIcon";
import { ASSETS_BASE_URL } from "../../config/api.js";
import "../../styles/movies/_poster-viewer.scss";

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.25;

const PosterViewerWindow = ({
  isOpen,
  isMinimized,
  movie,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const bodyRef = useRef(null);
  const panState = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [scale, setScale] = useState(null); // null until the image loads
  // While true, the image re-fits itself when the viewport changes (maximize/restore)
  const [isFitMode, setIsFitMode] = useState(true);
  const [naturalSize, setNaturalSize] = useState(null);

  const computeFitScale = useCallback((size) => {
    const body = bodyRef.current;
    if (!body || !size) return 1;
    return Math.min(
      body.clientWidth / size.width,
      body.clientHeight / size.height,
      1
    );
  }, []);

  const handleImageLoad = (e) => {
    const size = {
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    };
    setNaturalSize(size);
    setScale(computeFitScale(size));
    setIsFitMode(true);
  };

  // Re-fit when toggling maximize while in fit mode (body size changes after paint)
  useEffect(() => {
    if (!isFitMode || !naturalSize) return;
    const raf = requestAnimationFrame(() =>
      setScale(computeFitScale(naturalSize))
    );
    return () => cancelAnimationFrame(raf);
  }, [isMaximized, isFitMode, naturalSize, computeFitScale]);

  const clamp = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
  const zoomIn = () => {
    setIsFitMode(false);
    setScale((s) => clamp((s ?? 1) * ZOOM_STEP));
  };
  const zoomOut = () => {
    setIsFitMode(false);
    setScale((s) => clamp((s ?? 1) / ZOOM_STEP));
  };
  const zoomFit = () => {
    setIsFitMode(true);
    setScale(computeFitScale(naturalSize));
  };
  const zoom100 = () => {
    setIsFitMode(false);
    setScale(1);
  };
  const toggleFit = () => {
    if (scale === null) return;
    if (Math.abs(scale - 1) < 0.001) zoomFit();
    else zoom100();
  };

  // Click-drag panning of the scroll container
  const handlePanStart = (e) => {
    if (e.button !== 0) return;
    const body = bodyRef.current;
    panState.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: body.scrollLeft,
      scrollTop: body.scrollTop,
    };
    body.classList.add("panning");
  };

  useEffect(() => {
    const onMove = (e) => {
      const pan = panState.current;
      if (!pan) return;
      const body = bodyRef.current;
      body.scrollLeft = pan.scrollLeft - (e.clientX - pan.startX);
      body.scrollTop = pan.scrollTop - (e.clientY - pan.startY);
    };
    const onUp = () => {
      panState.current = null;
      bodyRef.current?.classList.remove("panning");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!isOpen) return null;

  const isLoaded = scale !== null && naturalSize;

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
        className={
          isMaximized
            ? "window poster-viewer-window maximized"
            : "window poster-viewer-window"
        }
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
          ...(isMinimized ? { display: "none" } : {}),
        }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Poster Viewer" />
            </span>
            <span className="window-title">
              {movie.title} ({movie.releaseYear})
            </span>
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

        <div className="poster-viewer-toolbar">
          <button className="btn" onClick={zoomFit} disabled={!isLoaded}>
            Fit
          </button>
          <button className="btn" onClick={zoom100} disabled={!isLoaded}>
            100%
          </button>
          <button className="btn" onClick={zoomOut} disabled={!isLoaded}>
            −
          </button>
          <button className="btn" onClick={zoomIn} disabled={!isLoaded}>
            +
          </button>
          <span className="poster-viewer-zoom-level">
            {isLoaded ? `${Math.round(scale * 100)}%` : "Loading…"}
          </span>
        </div>

        <div
          className="poster-viewer-body"
          ref={bodyRef}
          onMouseDown={handlePanStart}
        >
          <img
            src={`${ASSETS_BASE_URL}${movie.posterUrl}`}
            alt={`${movie.title} poster`}
            onLoad={handleImageLoad}
            onDoubleClick={toggleFit}
            style={
              isLoaded
                ? { width: naturalSize.width * scale }
                : { visibility: "hidden" }
            }
            draggable={false}
          />
        </div>
      </div>
    </Draggable>
  );
};

PosterViewerWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    releaseYear: PropTypes.number,
    posterUrl: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
};

export default PosterViewerWindow;
