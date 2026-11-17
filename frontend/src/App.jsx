import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import {
  WINDOWS,
  WINDOW_MAP,
  START_MENU_WINDOWS,
  DEFAULT_DESKTOP_ICON_IDS,
} from './config/windowRegistry';
import {
  DESKTOP_ICON_SIZE_MAP,
  DESKTOP_ICON_SIZE_IDS,
  DEFAULT_DESKTOP_ICON_SIZE,
} from './config/desktopIconSizes';
import { useWallpaper } from './components/wallpapers/useWallpaper';
import Taskbar from './components/ui/Taskbar';
import TooltipLayer from './components/ui/TooltipLayer';
import DesktopIconGrid from './components/desktop/DesktopIconGrid';
import DesktopContextMenu from './components/desktop/DesktopContextMenu';
import { useWindows } from './components/desktop/useWindows';
import './styles/desktop/_desktop-icons.scss';

// Desktop icon choice, kept in this browser like the wallpaper. Unknown or
// non-launchable ids (e.g. from an older version) are dropped.
const DESKTOP_ICONS_KEY = 'filmtrack-desktop-icons';
const loadDesktopIconIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DESKTOP_ICONS_KEY));
    if (Array.isArray(saved)) {
      return saved.filter(
        (id) => WINDOW_MAP[id] && WINDOW_MAP[id].startMenu !== false,
      );
    }
  } catch {
    // unreadable value — fall back to the defaults
  }
  return DEFAULT_DESKTOP_ICON_IDS;
};

// Desktop icon sort order, arrangement and size, chosen from the desktop's
// right-click menu (size also from the Desktop Icons window). Kept in this
// browser like the icon choice.
const DESKTOP_LAYOUT_KEY = 'filmtrack-desktop-layout';
const DEFAULT_DESKTOP_LAYOUT = {
  sort: 'default',
  arrange: 'columns',
  iconSize: DEFAULT_DESKTOP_ICON_SIZE,
};
const loadDesktopLayout = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DESKTOP_LAYOUT_KEY));
    return {
      sort: ['default', 'az', 'za'].includes(saved?.sort)
        ? saved.sort
        : DEFAULT_DESKTOP_LAYOUT.sort,
      arrange: ['columns', 'rows'].includes(saved?.arrange)
        ? saved.arrange
        : DEFAULT_DESKTOP_LAYOUT.arrange,
      iconSize: DESKTOP_ICON_SIZE_IDS.includes(saved?.iconSize)
        ? saved.iconSize
        : DEFAULT_DESKTOP_LAYOUT.iconSize,
    };
  } catch {
    return DEFAULT_DESKTOP_LAYOUT;
  }
};
import './styles/globals.scss';
import './styles/windows.scss';
import './styles/scrollbar.scss';
import './styles/taskbar.scss';
import './styles/accessories/_notepad.scss';

function App() {
  const [posterViewerMovie, setPosterViewerMovie] = useState(null);
  const [desktopIconIds, setDesktopIconIds] = useState(loadDesktopIconIds);
  const [desktopLayout, setDesktopLayout] = useState(loadDesktopLayout);
  const [desktopMenuPos, setDesktopMenuPos] = useState(null); // { x, y } while open
  // One-shot requests from the desktop menu, cleared by the window once acted on
  const [newNoteRequested, setNewNoteRequested] = useState(false);
  const [newMovieRequested, setNewMovieRequested] = useState(false);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState(null);

  // Selection, saving and painting the body background all live in the hook
  const wallpaper = useWallpaper();

  const {
    windows,
    openWindows,
    focused,
    zIndexOf,
    openWindow,
    focusWindow,
    raiseWindow,
    minimizeAllWindows,
    windowHandlers,
  } = useWindows();

  const handleViewPoster = useCallback(
    (movie) => {
      setPosterViewerMovie(movie);
      openWindow('posterViewer');
    },
    [openWindow],
  );

  const handleDesktopIconsChange = useCallback((ids) => {
    setDesktopIconIds(ids);
    try {
      localStorage.setItem(DESKTOP_ICONS_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable — the choice just won't survive a reload
    }
  }, []);

  const updateDesktopLayout = useCallback((changes) => {
    setDesktopLayout((prev) => {
      const next = { ...prev, ...changes };
      try {
        localStorage.setItem(DESKTOP_LAYOUT_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — the layout just won't survive a reload
      }
      return next;
    });
  }, []);

  const handleIconSizeChange = useCallback(
    (iconSize) => updateDesktopLayout({ iconSize }),
    [updateDesktopLayout],
  );

  // Icon size drives the --desktop-icon-* custom properties (_desktop-icons.scss)
  const desktopIconStyle = useMemo(() => {
    const { image, width } = DESKTOP_ICON_SIZE_MAP[desktopLayout.iconSize];
    return {
      '--desktop-icon-size': `${image}px`,
      '--desktop-icon-width': `${width}px`,
    };
  }, [desktopLayout.iconSize]);

  // "Default order" is the order chosen in the Desktop Icons window
  const sortedDesktopIconIds = useMemo(() => {
    if (desktopLayout.sort === 'default') return desktopIconIds;
    const sorted = [...desktopIconIds].sort((a, b) =>
      WINDOW_MAP[a].title.localeCompare(WINDOW_MAP[b].title),
    );
    return desktopLayout.sort === 'za' ? sorted.reverse() : sorted;
  }, [desktopIconIds, desktopLayout.sort]);

  // Our menu only on the desktop itself (background, icons, watermark);
  // windows, fields and the rest keep the browser's own menu
  const handleDesktopContextMenu = useCallback((e) => {
    if (e.target !== e.currentTarget && !e.target.closest('[data-desktop]')) {
      return;
    }
    e.preventDefault();
    // Opened from the keyboard (Menu key / Shift+F10) there's no pointer position
    const fromKeyboard = e.clientX === 0 && e.clientY === 0;
    setDesktopMenuPos(fromKeyboard ? { x: 16, y: 16 } : { x: e.clientX, y: e.clientY });
  }, []);

  const closeDesktopMenu = useCallback(() => setDesktopMenuPos(null), []);

  const handleNewNote = useCallback(() => {
    setNewNoteRequested(true);
    openWindow('notepad');
  }, [openWindow]);

  const handleNewMovie = useCallback(() => {
    setNewMovieRequested(true);
    openWindow('movies');
  }, [openWindow]);

  const handleNewNoteHandled = useCallback(() => setNewNoteRequested(false), []);
  const handleNewMovieHandled = useCallback(() => setNewMovieRequested(false), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return;

      // Ctrl/Cmd + M = Movies
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        openWindow('movies');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openWindow]);

  // What each window takes beyond the props they all share. Null keeps a window
  // unrendered: the poster viewer has nothing to show until a poster is picked.
  const windowProps = {
    wallpaper: {
      selectedId: wallpaper.selection,
      customImage: wallpaper.customImage,
      customMode: wallpaper.customMode,
      customSaved: wallpaper.customSaved,
      onSelect: wallpaper.selectWallpaper,
      onCustomPicture: wallpaper.setCustomPicture,
      onCustomRemove: wallpaper.removeCustomPicture,
      onCustomModeChange: wallpaper.changeCustomMode,
    },
    movies: {
      onViewPoster: handleViewPoster,
      newMovieRequested,
      onNewMovieHandled: handleNewMovieHandled,
    },
    series: { onViewPoster: handleViewPoster },
    notepad: { newNoteRequested, onNewNoteHandled: handleNewNoteHandled },
    help: { onOpenWindow: openWindow },
    desktopIcons: {
      selectedIds: desktopIconIds,
      onChange: handleDesktopIconsChange,
      iconSize: desktopLayout.iconSize,
      onIconSizeChange: handleIconSizeChange,
    },
    posterViewer: posterViewerMovie && { movie: posterViewerMovie },
  };

  const shownWindows = WINDOWS.filter(
    ({ id }) => windows[id].open && windowProps[id] !== null,
  );

  // Pressing anywhere on a window brings it forward at once, before the
  // button is released, so a window dragged from behind another is on top
  // while it moves. Each shown window is one child of the area, in the same
  // order, which is how the pressed element is traced back to its window.
  // Capture phase: nothing inside a window can stop it. The click that
  // follows still runs the window's own onFocus (cursor into its field).
  const handleWindowPress = (e) => {
    const index = Array.from(e.currentTarget.children).findIndex((child) =>
      child.contains(e.target),
    );
    if (index !== -1) raiseWindow(shownWindows[index].id);
  };

  return (
    <main
      className="container"
      style={desktopIconStyle}
      onClick={() => setSelectedDesktopIcon(null)}
      onContextMenu={handleDesktopContextMenu}
    >
      <DesktopIconGrid
        ids={sortedDesktopIconIds}
        arrange={desktopLayout.arrange}
        iconSize={desktopLayout.iconSize}
        selectedId={selectedDesktopIcon}
        onSelect={setSelectedDesktopIcon}
        onOpen={openWindow}
      />
      <h1
        data-desktop
        style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '3rem',
          textShadow:
            '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.3)',
        }}
      >
        FilmTrack
      </h1>
      <p id="system-watermark" data-desktop>
        FilmTrack⁰⁶
        <br />
        Build 3000
      </p>
      {/* The windows' parent stops at the taskbar, and bounds="parent" keeps
          a dragged window inside it. See .window-area in globals.scss. */}
      <div className="window-area" onMouseDownCapture={handleWindowPress}>
        {shownWindows.map(
          ({ id, icon, component }) => {
            const Window = component;
            return (
              <Suspense key={id} fallback={<div>Loading...</div>}>
                <Window
                  isOpen
                  isMinimized={windows[id].minimized}
                  zIndex={zIndexOf(id)}
                  icon={icon}
                  {...windowHandlers[id]}
                  {...windowProps[id]}
                />
              </Suspense>
            );
          },
        )}
      </div>
      <Taskbar
        openWindows={openWindows}
        onWindowFocus={focusWindow}
        onOpenWindow={openWindow}
        allWindows={START_MENU_WINDOWS}
        focusedWindow={focused}
      />
      {desktopMenuPos && (
        <DesktopContextMenu
          x={desktopMenuPos.x}
          y={desktopMenuPos.y}
          sort={desktopLayout.sort}
          arrange={desktopLayout.arrange}
          iconSize={desktopLayout.iconSize}
          onSortChange={(sort) => updateDesktopLayout({ sort })}
          onArrangeChange={(arrange) => updateDesktopLayout({ arrange })}
          onIconSizeChange={handleIconSizeChange}
          onNewNote={handleNewNote}
          onNewMovie={handleNewMovie}
          onShowDesktop={minimizeAllWindows}
          onOpenWindow={openWindow}
          onClose={closeDesktopMenu}
        />
      )}
      <TooltipLayer />
    </main>
  );
}

export default App;
