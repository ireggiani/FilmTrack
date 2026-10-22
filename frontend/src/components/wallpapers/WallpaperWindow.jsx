import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import WindowIcon from '../ui/WindowIcon';
import {
  SCENES,
  PATTERNS,
  WALLPAPER_MAP,
  CUSTOM_WALLPAPER_ID,
} from '../../config/wallpapers';
import { resolveWallpaper } from './useWallpaper';
import '../../styles/wallpapers/_wallpaper-window.scss';

const PREVIEW_WIDTH = 176; // px — keep in sync with .wallpaper-preview-screen

// Pattern thumbnails show tiles at 40% size, so a few repeats fit
const patternThumbStyle = (pattern) => ({
  backgroundImage: `url("${pattern.url}")`,
  backgroundSize: `${pattern.size * 0.4}px`,
});

// Windows 7-style Desktop Background picker: a live preview of the chosen
// wallpaper, then thumbnails grouped as built-in scenes, patterns and the
// user's own picture. Clicking a thumbnail applies it right away. Fill/Tile
// is only offered for the user's picture — scenes always fill the screen and
// patterns always tile.
const WallpaperWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  icon,
  selectedId,
  customImage,
  customMode,
  customSaved,
  onSelect,
  onCustomPicture,
  onCustomRemove,
  onCustomModeChange,
}) => {
  const nodeRef = useRef(null);
  const fileInputRef = useRef(null);
  // Natural size of the user's picture, to scale its tiles in the preview
  const [customSize, setCustomSize] = useState(null);

  useEffect(() => {
    setCustomSize(null);
    if (!customImage) return undefined;
    const img = new Image();
    img.onload = () => setCustomSize(img.naturalWidth);
    img.src = customImage;
    return () => {
      img.onload = null;
    };
  }, [customImage]);

  if (!isOpen) return null;

  const isCustom = selectedId === CUSTOM_WALLPAPER_ID && Boolean(customImage);
  const selected = isCustom ? null : WALLPAPER_MAP[selectedId];

  // The preview is a scaled-down screen, so tiles shrink by the same factor
  const scale = PREVIEW_WIDTH / window.innerWidth;
  const { url, tile } = resolveWallpaper(selectedId, customImage, customMode);
  const tileSize = isCustom ? customSize : selected?.size;
  const previewStyle = {
    aspectRatio: `${window.innerWidth} / ${window.innerHeight}`,
    backgroundImage: `url("${url}")`,
    backgroundSize: tile ? (tileSize ? `${tileSize * scale}px` : 'auto') : 'cover',
    backgroundRepeat: tile ? 'repeat' : 'no-repeat',
    backgroundPosition: tile ? '0 0' : 'center',
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // allow choosing the same file again later
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => onCustomPicture(event.target.result);
    reader.readAsDataURL(file);
  };

  const thumb = (id, name, content, extraClass = '') => (
    <div className="wallpaper-cell" key={id}>
      <button
        type="button"
        className={`wallpaper-thumb ${extraClass}${selectedId === id ? ' selected' : ''}`}
        aria-pressed={selectedId === id}
        title={name}
        onClick={() => onSelect(id)}
      >
        {content}
      </button>
      <span className="wallpaper-caption">{name}</span>
    </div>
  );

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window wallpaper-window"
        onClick={onFocus}
        style={{ zIndex, ...(isMinimized ? { display: 'none' } : {}) }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Wallpaper" />
            </span>
            <span className="window-title">Wallpaper Settings</span>
          </div>
          <div className="titlebar-right">
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

        <div className="window-content wallpaper-content">
          <div className="wallpaper-current">
            <div className="wallpaper-preview">
              <div className="wallpaper-preview-screen" style={previewStyle} />
              <div className="wallpaper-preview-stand" />
            </div>
            <div className="wallpaper-current-info">
              <span className="wallpaper-current-name">
                {isCustom ? 'Your picture' : selected?.name}
              </span>
              <span className="wallpaper-current-kind">
                {isCustom
                  ? 'Your own image'
                  : selected?.tile
                    ? 'Pattern — repeats across the screen'
                    : 'Scene — fills the screen'}
              </span>
              {isCustom && (
                <div className="wallpaper-mode" role="radiogroup" aria-label="Position">
                  {[
                    ['cover', 'Fill'],
                    ['tile', 'Tile'],
                  ].map(([mode, label]) => (
                    <label key={mode} className="wallpaper-mode-option">
                      <input
                        type="radio"
                        name="wallpaperMode"
                        value={mode}
                        checked={customMode === mode}
                        onChange={() => onCustomModeChange(mode)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
              {isCustom && !customSaved && (
                <span className="wallpaper-warning">
                  This picture is too large to remember — it will be gone
                  after a reload.
                </span>
              )}
            </div>
          </div>

          <div className="wallpaper-list">
            <h3 className="wallpaper-group">FilmTrack</h3>
            <div className="wallpaper-grid wallpaper-grid--scenes">
              {SCENES.map((scene) =>
                thumb(scene.id, scene.name, <img src={scene.url} alt="" />)
              )}
            </div>

            <h3 className="wallpaper-group">Patterns</h3>
            <div className="wallpaper-grid wallpaper-grid--patterns">
              {PATTERNS.map((pattern) =>
                thumb(
                  pattern.id,
                  pattern.name,
                  <span className="wallpaper-tile" style={patternThumbStyle(pattern)} />,
                  'square'
                )
              )}
            </div>

            <h3 className="wallpaper-group">Your picture</h3>
            <div className="wallpaper-grid wallpaper-grid--scenes">
              {customImage && (
                <div className="wallpaper-cell">
                  <button
                    type="button"
                    className={`wallpaper-thumb${isCustom ? ' selected' : ''}`}
                    aria-pressed={isCustom}
                    title="Your picture"
                    onClick={() => onSelect(CUSTOM_WALLPAPER_ID)}
                  >
                    <img src={customImage} alt="" />
                  </button>
                  <button
                    type="button"
                    className="wallpaper-remove"
                    title="Remove your picture"
                    aria-label="Remove your picture"
                    onClick={onCustomRemove}
                  >
                    ×
                  </button>
                  <span className="wallpaper-caption">Your picture</span>
                </div>
              )}
              <div className="wallpaper-cell">
                <button
                  type="button"
                  className="wallpaper-thumb wallpaper-browse"
                  title="Choose an image from your computer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span aria-hidden="true">+</span>
                </button>
                <span className="wallpaper-caption">
                  {customImage ? 'Choose another…' : 'Browse…'}
                </span>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </Draggable>
  );
};

WallpaperWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
  selectedId: PropTypes.string.isRequired,
  customImage: PropTypes.string,
  customMode: PropTypes.oneOf(['cover', 'tile']).isRequired,
  customSaved: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onCustomPicture: PropTypes.func.isRequired,
  onCustomRemove: PropTypes.func.isRequired,
  onCustomModeChange: PropTypes.func.isRequired,
};

export default WallpaperWindow;
