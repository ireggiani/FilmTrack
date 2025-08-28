import { useState, useRef } from 'react';

const WallpaperSelector = ({ onWallpaperChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onWallpaperChange(event.target.result);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearWallpaper = () => {
    onWallpaperChange(null);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <button 
        className="btn btn-primary"
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0.5rem', borderRadius: '50%', width: '50px', height: '50px' }}
      >
        🎨
      </button>
      
      {isOpen && (
        <div className="glass" style={{ 
          position: 'absolute', 
          top: '60px', 
          right: '0', 
          padding: '1rem',
          minWidth: '200px'
        }}>
          <button 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          >
            Select Wallpaper
          </button>
          <button 
            className="btn btn-primary"
            onClick={clearWallpaper}
            style={{ width: '100%' }}
          >
            Remove Wallpaper
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default WallpaperSelector;