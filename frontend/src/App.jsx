import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import {
  WINDOW_MAP,
  START_MENU_WINDOWS,
  DEFAULT_DESKTOP_ICON_IDS,
} from './config/windowRegistry';
import { useWallpaper } from './components/wallpapers/useWallpaper';
const GenreWindow = lazy(() => import('./components/genres/GenreWindow'));
const WallpaperWindow = lazy(
  () => import('./components/wallpapers/WallpaperWindow'),
);
const CountryWindow = lazy(
  () => import('./components/countries/CountryWindow'),
);
const DirectorWindow = lazy(
  () => import('./components/directors/DirectorWindow'),
);
const ActorWindow = lazy(() => import('./components/actors/ActorWindow'));
const Calculator = lazy(() => import('./components/accessories/Calculator'));
const Calendar = lazy(() => import('./components/accessories/Calendar'));
const Clock = lazy(() => import('./components/accessories/Clock'));
const Notepad = lazy(() => import('./components/accessories/Notepad'));
import Taskbar from './components/ui/Taskbar';
import TooltipLayer from './components/ui/TooltipLayer';
import DesktopIconGrid from './components/desktop/DesktopIconGrid';
import DesktopContextMenu from './components/desktop/DesktopContextMenu';
import './styles/desktop/_desktop-icons.scss';

const BackupWindow = lazy(() => import('./components/backup/BackupWindow'));
const StatsWindow = lazy(() => import('./components/stats/StatsWindow'));
const MoviesWindow = lazy(() => import('./components/movies/MoviesWindow'));
const PosterViewerWindow = lazy(
  () => import('./components/movies/PosterViewerWindow'),
);
const PairsGame = lazy(() => import('./components/games/PairsGame'));
const HelpWindow = lazy(() => import('./components/help/HelpWindow'));
const DesktopIconsWindow = lazy(
  () => import('./components/desktop/DesktopIconsWindow'),
);

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

// Desktop icon sort order and arrangement, chosen from the desktop's
// right-click menu. Kept in this browser like the icon choice.
const DESKTOP_LAYOUT_KEY = 'filmtrack-desktop-layout';
const DEFAULT_DESKTOP_LAYOUT = { sort: 'default', arrange: 'columns' };
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
  const [refreshGenres, setRefreshGenres] = useState(0);
  const [refreshCountries, setRefreshCountries] = useState(0);
  const [refreshDirectors, setRefreshDirectors] = useState(0);
  const [refreshActors, setRefreshActors] = useState(0);
  const [refreshMovies, setRefreshMovies] = useState(0);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [movies, setMovies] = useState([]);
  const [genreWindowOpen, setGenreWindowOpen] = useState(false);
  const [wallpaperWindowOpen, setWallpaperWindowOpen] = useState(false);
  const [countryWindowOpen, setCountryWindowOpen] = useState(false);
  const [directorWindowOpen, setDirectorWindowOpen] = useState(false);
  const [actorWindowOpen, setActorWindowOpen] = useState(false);
  const [moviesWindowOpen, setMoviesWindowOpen] = useState(false);
  const [backupWindowOpen, setBackupWindowOpen] = useState(false);
  const [calculatorWindowOpen, setCalculatorWindowOpen] = useState(false);
  const [calendarWindowOpen, setCalendarWindowOpen] = useState(false);
  const [clockWindowOpen, setClockWindowOpen] = useState(false);
  const [notepadWindowOpen, setNotepadWindowOpen] = useState(false);
  const [statsWindowOpen, setStatsWindowOpen] = useState(false);
  const [posterViewerWindowOpen, setPosterViewerWindowOpen] = useState(false);
  const [posterViewerMovie, setPosterViewerMovie] = useState(null);
  const [pairsWindowOpen, setPairsWindowOpen] = useState(false);
  const [helpWindowOpen, setHelpWindowOpen] = useState(false);
  const [desktopIconsWindowOpen, setDesktopIconsWindowOpen] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState(null);
  const [genreMinimized, setGenreMinimized] = useState(false);
  const [wallpaperMinimized, setWallpaperMinimized] = useState(false);
  const [countryMinimized, setCountryMinimized] = useState(false);
  const [directorMinimized, setDirectorMinimized] = useState(false);
  const [actorMinimized, setActorMinimized] = useState(false);
  const [moviesMinimized, setMoviesMinimized] = useState(false);
  const [backupMinimized, setBackupMinimized] = useState(false);
  const [calculatorMinimized, setCalculatorMinimized] = useState(false);
  const [calendarMinimized, setCalendarMinimized] = useState(false);
  const [clockMinimized, setClockMinimized] = useState(false);
  const [notepadMinimized, setNotepadMinimized] = useState(false);
  const [statsMinimized, setStatsMinimized] = useState(false);
  const [posterViewerMinimized, setPosterViewerMinimized] = useState(false);
  const [pairsMinimized, setPairsMinimized] = useState(false);
  const [helpMinimized, setHelpMinimized] = useState(false);
  const [desktopIconsMinimized, setDesktopIconsMinimized] = useState(false);
  const [desktopIconIds, setDesktopIconIds] = useState(loadDesktopIconIds);
  const [desktopLayout, setDesktopLayout] = useState(loadDesktopLayout);
  const [desktopMenuPos, setDesktopMenuPos] = useState(null); // { x, y } while open
  // One-shot requests from the desktop menu, cleared by the window once acted on
  const [newNoteRequested, setNewNoteRequested] = useState(false);
  const [newMovieRequested, setNewMovieRequested] = useState(false);
  const [windowStack, setWindowStack] = useState([]);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState(null);

  const handleGenreAdded = useCallback(() => {
    setRefreshGenres((prev) => prev + 1);
  }, []);

  const handleGenresLoaded = useCallback((loadedGenres) => {
    setGenres(loadedGenres);
  }, []);

  const handleCountryAdded = useCallback(() => {
    setRefreshCountries((prev) => prev + 1);
  }, []);

  const handleCountriesLoaded = useCallback((loadedCountries) => {
    setCountries(loadedCountries);
  }, []);

  const handleDirectorAdded = useCallback(() => {
    setRefreshDirectors((prev) => prev + 1);
  }, []);

  const handleDirectorsLoaded = useCallback((loadedDirectors) => {
    setDirectors(loadedDirectors);
  }, []);

  const handleActorAdded = useCallback(() => {
    setRefreshActors((prev) => prev + 1);
  }, []);

  const handleActorsLoaded = useCallback((loadedActors) => {
    setActors(loadedActors);
  }, []);

  const handleMoviesLoaded = useCallback((loadedMovies) => {
    setMovies(loadedMovies);
  }, []);

  // Selection, saving and painting the body background all live in the hook
  const wallpaper = useWallpaper();

  // Every window's minimized-state setter (setters are stable, so this never
  // changes); used to restore one window on focus or minimize them all
  const minimizeSetters = useMemo(
    () => ({
      genres: setGenreMinimized,
      wallpaper: setWallpaperMinimized,
      countries: setCountryMinimized,
      directors: setDirectorMinimized,
      actors: setActorMinimized,
      movies: setMoviesMinimized,
      backup: setBackupMinimized,
      calculator: setCalculatorMinimized,
      calendar: setCalendarMinimized,
      clock: setClockMinimized,
      notepad: setNotepadMinimized,
      stats: setStatsMinimized,
      posterViewer: setPosterViewerMinimized,
      pairs: setPairsMinimized,
      help: setHelpMinimized,
      desktopIcons: setDesktopIconsMinimized,
    }),
    [],
  );

  // Show Desktop: minimize every window (closed ones too — harmless, since
  // opening a window always un-minimizes it)
  const minimizeAllWindows = useCallback(() => {
    Object.values(minimizeSetters).forEach((setMinimized) => setMinimized(true));
  }, [minimizeSetters]);

  const handleWindowFocus = useCallback((windowId) => {
    setWindowStack((prevStack) => {
      const newStack = prevStack.filter((id) => id !== windowId);
      newStack.push(windowId);
      return newStack;
    });
    setFocusedWindow(windowId);

    minimizeSetters[windowId]?.(false);

    const focusSelectors = {
      genres: '#genreName',
      wallpaper: '.wallpaper-thumb.selected',
      countries: '#countryName',
      directors: '#directorName',
      actors: '#actorName',
    };
    const selector = focusSelectors[windowId];
    if (selector) {
      setTimeout(() => document.querySelector(selector)?.focus(), 10);
    }
  }, [minimizeSetters]);

  const windowFocusHandlers = useMemo(
    () => ({
      genres: () => handleWindowFocus('genres'),
      wallpaper: () => handleWindowFocus('wallpaper'),
      countries: () => handleWindowFocus('countries'),
      directors: () => handleWindowFocus('directors'),
      actors: () => handleWindowFocus('actors'),
      movies: () => handleWindowFocus('movies'),
      backup: () => handleWindowFocus('backup'),
      calculator: () => handleWindowFocus('calculator'),
      calendar: () => handleWindowFocus('calendar'),
      clock: () => handleWindowFocus('clock'),
      notepad: () => handleWindowFocus('notepad'),
      stats: () => handleWindowFocus('stats'),
      posterViewer: () => handleWindowFocus('posterViewer'),
      pairs: () => handleWindowFocus('pairs'),
      help: () => handleWindowFocus('help'),
      desktopIcons: () => handleWindowFocus('desktopIcons'),
    }),
    [handleWindowFocus],
  );

  const memoizedOpenWindows = useMemo(
    () => [
      ...(genreWindowOpen ? [WINDOW_MAP.genres] : []),
      ...(wallpaperWindowOpen ? [WINDOW_MAP.wallpaper] : []),
      ...(countryWindowOpen ? [WINDOW_MAP.countries] : []),
      ...(directorWindowOpen ? [WINDOW_MAP.directors] : []),
      ...(actorWindowOpen ? [WINDOW_MAP.actors] : []),
      ...(moviesWindowOpen ? [WINDOW_MAP.movies] : []),
      ...(backupWindowOpen ? [WINDOW_MAP.backup] : []),
      ...(calculatorWindowOpen ? [WINDOW_MAP.calculator] : []),
      ...(calendarWindowOpen ? [WINDOW_MAP.calendar] : []),
      ...(clockWindowOpen ? [WINDOW_MAP.clock] : []),
      ...(notepadWindowOpen ? [WINDOW_MAP.notepad] : []),
      ...(statsWindowOpen ? [WINDOW_MAP.stats] : []),
      ...(posterViewerWindowOpen ? [WINDOW_MAP.posterViewer] : []),
      ...(pairsWindowOpen ? [WINDOW_MAP.pairs] : []),
      ...(helpWindowOpen ? [WINDOW_MAP.help] : []),
      ...(desktopIconsWindowOpen ? [WINDOW_MAP.desktopIcons] : []),
    ],
    [
      genreWindowOpen,
      wallpaperWindowOpen,
      countryWindowOpen,
      directorWindowOpen,
      actorWindowOpen,
      moviesWindowOpen,
      backupWindowOpen,
      calculatorWindowOpen,
      calendarWindowOpen,
      clockWindowOpen,
      notepadWindowOpen,
      statsWindowOpen,
      posterViewerWindowOpen,
      pairsWindowOpen,
      helpWindowOpen,
      desktopIconsWindowOpen,
    ],
  );

  const openWindow = useCallback(
    (windowId) => {
      switch (windowId) {
        case 'genres':
          setGenreWindowOpen(true);
          break;
        case 'wallpaper':
          setWallpaperWindowOpen(true);
          break;
        case 'countries':
          setCountryWindowOpen(true);
          break;
        case 'directors':
          setDirectorWindowOpen(true);
          break;
        case 'actors':
          setActorWindowOpen(true);
          break;
        case 'movies':
          setMoviesWindowOpen(true);
          break;
        case 'backup':
          setBackupWindowOpen(true);
          break;
        case 'calculator':
          setCalculatorWindowOpen(true);
          break;
        case 'calendar':
          setCalendarWindowOpen(true);
          break;
        case 'clock':
          setClockWindowOpen(true);
          break;
        case 'notepad':
          setNotepadWindowOpen(true);
          break;
        case 'stats':
          setStatsWindowOpen(true);
          break;
        case 'posterViewer':
          setPosterViewerWindowOpen(true);
          break;
        case 'pairs':
          setPairsWindowOpen(true);
          break;
        case 'help':
          setHelpWindowOpen(true);
          break;
        case 'desktopIcons':
          setDesktopIconsWindowOpen(true);
          break;
        default:
          break;
      }
      handleWindowFocus(windowId);
    },
    [handleWindowFocus],
  );

  const closeWindow = useCallback((windowId) => {
    switch (windowId) {
      case 'genres':
        setGenreWindowOpen(false);
        break;
      case 'wallpaper':
        setWallpaperWindowOpen(false);
        break;
      case 'countries':
        setCountryWindowOpen(false);
        break;
      case 'directors':
        setDirectorWindowOpen(false);
        break;
      case 'actors':
        setActorWindowOpen(false);
        break;
      case 'movies':
        setMoviesWindowOpen(false);
        break;
      case 'backup':
        setBackupWindowOpen(false);
        break;
      case 'calculator':
        setCalculatorWindowOpen(false);
        break;
      case 'calendar':
        setCalendarWindowOpen(false);
        break;
      case 'clock':
        setClockWindowOpen(false);
        break;
      case 'notepad':
        setNotepadWindowOpen(false);
        break;
      case 'stats':
        setStatsWindowOpen(false);
        break;
      case 'posterViewer':
        setPosterViewerWindowOpen(false);
        break;
      case 'pairs':
        setPairsWindowOpen(false);
        break;
      case 'help':
        setHelpWindowOpen(false);
        break;
      case 'desktopIcons':
        setDesktopIconsWindowOpen(false);
        break;
      default:
        break;
    }
    setWindowStack((prevStack) => prevStack.filter((id) => id !== windowId));
  }, []);

  const handleCloseGenreWindow = useCallback(
    () => closeWindow('genres'),
    [closeWindow],
  );
  const handleMinimizeGenreWindow = useCallback((e) => {
    e?.stopPropagation();
    setGenreMinimized(true);
  }, []);

  const handleCloseWallpaperWindow = useCallback(
    () => closeWindow('wallpaper'),
    [closeWindow],
  );
  const handleMinimizeWallpaperWindow = useCallback((e) => {
    e?.stopPropagation();
    setWallpaperMinimized(true);
  }, []);

  const handleCloseCountryWindow = useCallback(
    () => closeWindow('countries'),
    [closeWindow],
  );
  const handleMinimizeCountryWindow = useCallback((e) => {
    e?.stopPropagation();
    setCountryMinimized(true);
  }, []);

  const handleCloseDirectorWindow = useCallback(
    () => closeWindow('directors'),
    [closeWindow],
  );
  const handleMinimizeDirectorWindow = useCallback((e) => {
    e?.stopPropagation();
    setDirectorMinimized(true);
  }, []);

  const handleCloseActorWindow = useCallback(
    () => closeWindow('actors'),
    [closeWindow],
  );
  const handleMinimizeActorWindow = useCallback((e) => {
    e?.stopPropagation();
    setActorMinimized(true);
  }, []);

  const handleCloseMoviesWindow = useCallback(
    () => closeWindow('movies'),
    [closeWindow],
  );
  const handleMinimizeMoviesWindow = useCallback((e) => {
    e?.stopPropagation();
    setMoviesMinimized(true);
  }, []);

  const handleCloseBackupWindow = useCallback(
    () => closeWindow('backup'),
    [closeWindow],
  );
  const handleMinimizeBackupWindow = useCallback((e) => {
    e?.stopPropagation();
    setBackupMinimized(true);
  }, []);

  const handleCloseCalculatorWindow = useCallback(
    () => closeWindow('calculator'),
    [closeWindow],
  );
  const handleMinimizeCalculatorWindow = useCallback((e) => {
    e?.stopPropagation();
    setCalculatorMinimized(true);
  }, []);

  const handleCloseCalendarWindow = useCallback(
    () => closeWindow('calendar'),
    [closeWindow],
  );
  const handleMinimizeCalendarWindow = useCallback((e) => {
    e?.stopPropagation();
    setCalendarMinimized(true);
  }, []);

  const handleCloseClockWindow = useCallback(
    () => closeWindow('clock'),
    [closeWindow],
  );
  const handleMinimizeClockWindow = useCallback((e) => {
    e?.stopPropagation();
    setClockMinimized(true);
  }, []);

  const handleCloseNotepadWindow = useCallback(
    () => closeWindow('notepad'),
    [closeWindow],
  );
  const handleMinimizeNotepadWindow = useCallback((e) => {
    e?.stopPropagation();
    setNotepadMinimized(true);
  }, []);

  const handleCloseStatsWindow = useCallback(
    () => closeWindow('stats'),
    [closeWindow],
  );
  const handleMinimizeStatsWindow = useCallback((e) => {
    e?.stopPropagation();
    setStatsMinimized(true);
  }, []);

  const handleClosePosterViewerWindow = useCallback(
    () => closeWindow('posterViewer'),
    [closeWindow],
  );
  const handleMinimizePosterViewerWindow = useCallback((e) => {
    e?.stopPropagation();
    setPosterViewerMinimized(true);
  }, []);

  const handleViewPoster = useCallback(
    (movie) => {
      setPosterViewerMovie(movie);
      openWindow('posterViewer');
    },
    [openWindow],
  );

  const handleClosePairsWindow = useCallback(
    () => closeWindow('pairs'),
    [closeWindow],
  );
  const handleMinimizePairsWindow = useCallback((e) => {
    e?.stopPropagation();
    setPairsMinimized(true);
  }, []);

  const handleCloseHelpWindow = useCallback(
    () => closeWindow('help'),
    [closeWindow],
  );
  const handleMinimizeHelpWindow = useCallback((e) => {
    e?.stopPropagation();
    setHelpMinimized(true);
  }, []);

  const handleCloseDesktopIconsWindow = useCallback(
    () => closeWindow('desktopIcons'),
    [closeWindow],
  );
  const handleMinimizeDesktopIconsWindow = useCallback((e) => {
    e?.stopPropagation();
    setDesktopIconsMinimized(true);
  }, []);

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

  return (
    <main
      className="container"
      onClick={() => setSelectedDesktopIcon(null)}
      onContextMenu={handleDesktopContextMenu}
    >
      <DesktopIconGrid
        ids={sortedDesktopIconIds}
        arrange={desktopLayout.arrange}
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
      {genreWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <GenreWindow
            isOpen={genreWindowOpen}
            isMinimized={genreMinimized}
            onClose={handleCloseGenreWindow}
            onMinimize={handleMinimizeGenreWindow}
            genres={genres}
            onGenreAdded={handleGenreAdded}
            onGenresLoaded={handleGenresLoaded}
            refreshGenres={refreshGenres}
            onFocus={windowFocusHandlers.genres}
            zIndex={100 + windowStack.indexOf('genres')}
            icon={WINDOW_MAP.genres.icon}
          />
        </Suspense>
      )}
      {wallpaperWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <WallpaperWindow
            isOpen={wallpaperWindowOpen}
            isMinimized={wallpaperMinimized}
            onClose={handleCloseWallpaperWindow}
            onMinimize={handleMinimizeWallpaperWindow}
            selectedId={wallpaper.selection}
            customImage={wallpaper.customImage}
            customMode={wallpaper.customMode}
            customSaved={wallpaper.customSaved}
            onSelect={wallpaper.selectWallpaper}
            onCustomPicture={wallpaper.setCustomPicture}
            onCustomRemove={wallpaper.removeCustomPicture}
            onCustomModeChange={wallpaper.changeCustomMode}
            onFocus={windowFocusHandlers.wallpaper}
            zIndex={100 + windowStack.indexOf('wallpaper')}
            icon={WINDOW_MAP.wallpaper.icon}
          />
        </Suspense>
      )}
      {countryWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <CountryWindow
            isOpen={countryWindowOpen}
            isMinimized={countryMinimized}
            onClose={handleCloseCountryWindow}
            onMinimize={handleMinimizeCountryWindow}
            countries={countries}
            onCountryAdded={handleCountryAdded}
            onCountriesLoaded={handleCountriesLoaded}
            refreshCountries={refreshCountries}
            onFocus={windowFocusHandlers.countries}
            zIndex={100 + windowStack.indexOf('countries')}
            icon={WINDOW_MAP.countries.icon}
          />
        </Suspense>
      )}
      {directorWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <DirectorWindow
            isOpen={directorWindowOpen}
            isMinimized={directorMinimized}
            onClose={handleCloseDirectorWindow}
            onMinimize={handleMinimizeDirectorWindow}
            directors={directors}
            onDirectorAdded={handleDirectorAdded}
            onDirectorsLoaded={handleDirectorsLoaded}
            refreshDirectors={refreshDirectors}
            onFocus={windowFocusHandlers.directors}
            zIndex={100 + windowStack.indexOf('directors')}
            icon={WINDOW_MAP.directors.icon}
          />
        </Suspense>
      )}
      {actorWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <ActorWindow
            isOpen={actorWindowOpen}
            isMinimized={actorMinimized}
            onClose={handleCloseActorWindow}
            onMinimize={handleMinimizeActorWindow}
            actors={actors}
            onActorAdded={handleActorAdded}
            onActorsLoaded={handleActorsLoaded}
            refreshActors={refreshActors}
            onFocus={windowFocusHandlers.actors}
            zIndex={100 + windowStack.indexOf('actors')}
            icon={WINDOW_MAP.actors.icon}
          />
        </Suspense>
      )}
      {moviesWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <MoviesWindow
            isOpen={moviesWindowOpen}
            isMinimized={moviesMinimized}
            onClose={handleCloseMoviesWindow}
            onMinimize={handleMinimizeMoviesWindow}
            movies={movies}
            onMoviesLoaded={handleMoviesLoaded}
            refreshMovies={refreshMovies}
            setRefreshMovies={setRefreshMovies}
            onFocus={windowFocusHandlers.movies}
            onViewPoster={handleViewPoster}
            newMovieRequested={newMovieRequested}
            onNewMovieHandled={handleNewMovieHandled}
            zIndex={100 + windowStack.indexOf('movies')}
            icon={WINDOW_MAP.movies.icon}
          />
        </Suspense>
      )}
      {backupWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <BackupWindow
            isOpen={backupWindowOpen}
            isMinimized={backupMinimized}
            onClose={handleCloseBackupWindow}
            onMinimize={handleMinimizeBackupWindow}
            onFocus={windowFocusHandlers.backup}
            zIndex={100 + windowStack.indexOf('backup')}
            icon={WINDOW_MAP.backup.icon}
          />
        </Suspense>
      )}
      {calculatorWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <Calculator
            isOpen={calculatorWindowOpen}
            isMinimized={calculatorMinimized}
            onClose={handleCloseCalculatorWindow}
            onMinimize={handleMinimizeCalculatorWindow}
            onFocus={windowFocusHandlers.calculator}
            zIndex={100 + windowStack.indexOf('calculator')}
            icon={WINDOW_MAP.calculator.icon}
          />
        </Suspense>
      )}
      {calendarWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <Calendar
            isOpen={calendarWindowOpen}
            isMinimized={calendarMinimized}
            onClose={handleCloseCalendarWindow}
            onMinimize={handleMinimizeCalendarWindow}
            onFocus={windowFocusHandlers.calendar}
            zIndex={100 + windowStack.indexOf('calendar')}
            icon={WINDOW_MAP.calendar.icon}
          />
        </Suspense>
      )}
      {clockWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <Clock
            isOpen={clockWindowOpen}
            isMinimized={clockMinimized}
            onClose={handleCloseClockWindow}
            onMinimize={handleMinimizeClockWindow}
            onFocus={windowFocusHandlers.clock}
            zIndex={100 + windowStack.indexOf('clock')}
            icon={WINDOW_MAP.clock.icon}
          />
        </Suspense>
      )}
      {notepadWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <Notepad
            isOpen={notepadWindowOpen}
            isMinimized={notepadMinimized}
            onClose={handleCloseNotepadWindow}
            onMinimize={handleMinimizeNotepadWindow}
            onFocus={windowFocusHandlers.notepad}
            newNoteRequested={newNoteRequested}
            onNewNoteHandled={handleNewNoteHandled}
            zIndex={100 + windowStack.indexOf('notepad')}
            icon={WINDOW_MAP.notepad.icon}
          />
        </Suspense>
      )}
      {statsWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <StatsWindow
            isOpen={statsWindowOpen}
            isMinimized={statsMinimized}
            onClose={handleCloseStatsWindow}
            onMinimize={handleMinimizeStatsWindow}
            onFocus={windowFocusHandlers.stats}
            zIndex={100 + windowStack.indexOf('stats')}
            icon={WINDOW_MAP.stats.icon}
          />
        </Suspense>
      )}
      {pairsWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <PairsGame
            isOpen={pairsWindowOpen}
            isMinimized={pairsMinimized}
            onClose={handleClosePairsWindow}
            onMinimize={handleMinimizePairsWindow}
            onFocus={windowFocusHandlers.pairs}
            zIndex={100 + windowStack.indexOf('pairs')}
            icon={WINDOW_MAP.pairs.icon}
          />
        </Suspense>
      )}
      {helpWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <HelpWindow
            isOpen={helpWindowOpen}
            isMinimized={helpMinimized}
            onClose={handleCloseHelpWindow}
            onMinimize={handleMinimizeHelpWindow}
            onFocus={windowFocusHandlers.help}
            onOpenWindow={openWindow}
            zIndex={100 + windowStack.indexOf('help')}
            icon={WINDOW_MAP.help.icon}
          />
        </Suspense>
      )}
      {desktopIconsWindowOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <DesktopIconsWindow
            isOpen={desktopIconsWindowOpen}
            isMinimized={desktopIconsMinimized}
            onClose={handleCloseDesktopIconsWindow}
            onMinimize={handleMinimizeDesktopIconsWindow}
            onFocus={windowFocusHandlers.desktopIcons}
            zIndex={100 + windowStack.indexOf('desktopIcons')}
            icon={WINDOW_MAP.desktopIcons.icon}
            selectedIds={desktopIconIds}
            onChange={handleDesktopIconsChange}
          />
        </Suspense>
      )}
      {posterViewerWindowOpen && posterViewerMovie && (
        <Suspense fallback={<div>Loading...</div>}>
          <PosterViewerWindow
            isOpen={posterViewerWindowOpen}
            isMinimized={posterViewerMinimized}
            movie={posterViewerMovie}
            onClose={handleClosePosterViewerWindow}
            onMinimize={handleMinimizePosterViewerWindow}
            onFocus={windowFocusHandlers.posterViewer}
            zIndex={100 + windowStack.indexOf('posterViewer')}
            icon={WINDOW_MAP.posterViewer.icon}
          />
        </Suspense>
      )}
      <Taskbar
        openWindows={memoizedOpenWindows}
        onWindowFocus={handleWindowFocus}
        onOpenWindow={openWindow}
        allWindows={START_MENU_WINDOWS}
        focusedWindow={focusedWindow}
      />
      {desktopMenuPos && (
        <DesktopContextMenu
          x={desktopMenuPos.x}
          y={desktopMenuPos.y}
          sort={desktopLayout.sort}
          arrange={desktopLayout.arrange}
          onSortChange={(sort) => updateDesktopLayout({ sort })}
          onArrangeChange={(arrange) => updateDesktopLayout({ arrange })}
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
