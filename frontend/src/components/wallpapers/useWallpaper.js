import { useState, useEffect, useCallback } from 'react';
import {
  WALLPAPER_MAP,
  DEFAULT_WALLPAPER_ID,
  CUSTOM_WALLPAPER_ID,
} from '../../config/wallpapers';

// Wallpaper choice, kept in this browser only (not part of backups):
// - SELECTION_KEY: a built-in wallpaper id, or CUSTOM_WALLPAPER_ID
// - CUSTOM_KEY:    the user's own picture as a data URL, remembered even while
//                  a built-in is selected so they can switch back to it
// - MODE_KEY:      'cover' or 'tile' — only applies to the user's picture
// Older versions stored the picture itself under SELECTION_KEY; it's moved
// to CUSTOM_KEY on load.
const SELECTION_KEY = 'filmtrack-wallpaper';
const CUSTOM_KEY = 'filmtrack-wallpaper-custom';
const MODE_KEY = 'filmtrack-wallpaper-mode';

// localStorage can be unavailable, or full (pictures are large) — never let
// that break the app
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const loadInitial = () => {
  let selection = read(SELECTION_KEY);
  let customImage = read(CUSTOM_KEY);

  if (selection && selection !== CUSTOM_WALLPAPER_ID && !WALLPAPER_MAP[selection]) {
    // Legacy: the saved value is the picture itself
    customImage = selection;
    selection = CUSTOM_WALLPAPER_ID;
    write(CUSTOM_KEY, customImage);
    write(SELECTION_KEY, selection);
  }

  if (!selection || (selection === CUSTOM_WALLPAPER_ID && !customImage)) {
    selection = DEFAULT_WALLPAPER_ID;
  }

  return {
    selection,
    customImage,
    customMode: read(MODE_KEY) === 'tile' ? 'tile' : 'cover',
  };
};

/** How the given choice is painted: image URL and whether it tiles */
export const resolveWallpaper = (selection, customImage, customMode) => {
  if (selection === CUSTOM_WALLPAPER_ID && customImage) {
    return { url: customImage, tile: customMode === 'tile' };
  }
  const wallpaper = WALLPAPER_MAP[selection] ?? WALLPAPER_MAP[DEFAULT_WALLPAPER_ID];
  return { url: wallpaper.url, tile: Boolean(wallpaper.tile) };
};

export const useWallpaper = () => {
  const [initial] = useState(loadInitial);
  const [selection, setSelection] = useState(initial.selection);
  const [customImage, setCustomImage] = useState(initial.customImage);
  const [customMode, setCustomMode] = useState(initial.customMode);
  // False when the picture was too big to store: it's shown for this session
  // but will be gone after a reload
  const [customSaved, setCustomSaved] = useState(true);

  useEffect(() => {
    const { url, tile } = resolveWallpaper(selection, customImage, customMode);
    const { style } = document.body;
    style.backgroundImage = `url("${url}")`;
    style.backgroundSize = tile ? 'auto' : 'cover';
    style.backgroundRepeat = tile ? 'repeat' : 'no-repeat';
    style.backgroundPosition = tile ? '0 0' : 'center';
    style.backgroundAttachment = 'fixed';
  }, [selection, customImage, customMode]);

  const selectWallpaper = useCallback((id) => {
    setSelection(id);
    write(SELECTION_KEY, id);
  }, []);

  const setCustomPicture = useCallback(
    (dataUrl) => {
      setCustomImage(dataUrl);
      setCustomSaved(write(CUSTOM_KEY, dataUrl));
      selectWallpaper(CUSTOM_WALLPAPER_ID);
    },
    [selectWallpaper],
  );

  const removeCustomPicture = useCallback(() => {
    setCustomImage(null);
    setCustomSaved(true);
    write(CUSTOM_KEY, null);
    setSelection((current) => {
      if (current !== CUSTOM_WALLPAPER_ID) return current;
      write(SELECTION_KEY, DEFAULT_WALLPAPER_ID);
      return DEFAULT_WALLPAPER_ID;
    });
  }, []);

  const changeCustomMode = useCallback((mode) => {
    setCustomMode(mode);
    write(MODE_KEY, mode);
  }, []);

  return {
    selection,
    customImage,
    customMode,
    customSaved,
    selectWallpaper,
    setCustomPicture,
    removeCustomPicture,
    changeCustomMode,
  };
};
