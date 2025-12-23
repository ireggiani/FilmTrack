import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import notepadIcon from "./assets/notepad-icon.png";
const GenreWindow = lazy(() => import("./components/genres/GenreWindow"));
const WallpaperWindow = lazy(() =>
  import("./components/wallpapers/WallpaperWindow")
);
const CountryWindow = lazy(() =>
  import("./components/countries/CountryWindow")
);
const DirectorWindow = lazy(() =>
  import("./components/directors/DirectorWindow")
);
const ActorWindow = lazy(() => import("./components/actors/ActorWindow"));
const Calculator = lazy(() => import("./components/accessories/Calculator"));
const Calendar = lazy(() => import("./components/accessories/Calendar"));
const Clock = lazy(() => import("./components/accessories/Clock"));
const Notepad = lazy(() => import("./components/accessories/Notepad"));
import Taskbar from "./components/ui/Taskbar";

const BackupWindow = lazy(() => import("./components/backup/BackupWindow"));
const MoviesWindow = lazy(() => import("./components/movies/MoviesWindow"));
import "./styles/globals.scss";
import "./styles/windows.scss";
import "./styles/scrollbar.scss";
import "./styles/taskbar.scss";
import "./styles/accessories/_notepad.scss";

function App() {
  const [refreshGenres, setRefreshGenres] = useState(0);
  const [refreshCountries, setRefreshCountries] = useState(0);
  const [refreshDirectors, setRefreshDirectors] = useState(0);
  const [refreshActors, setRefreshActors] = useState(0);
  const [refreshMovies, setRefreshMovies] = useState(0);
  const [wallpaper, setWallpaper] = useState(null);
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
  const [windowStack, setWindowStack] = useState([]);

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

  const handleWallpaperChange = useCallback((imageUrl) => {
    setWallpaper(imageUrl);

    if (imageUrl) {
      localStorage.setItem("filmtrack-wallpaper", imageUrl);
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      localStorage.removeItem("filmtrack-wallpaper");
      document.body.style.backgroundImage = "";
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("filmtrack-wallpaper");
    if (saved && saved !== "") {
      setWallpaper(saved);
      document.body.style.backgroundImage = `url(${saved})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "";
    }
  }, []);

  const handleWindowFocus = useCallback(
    (windowId) => {
      setWindowStack((prevStack) => {
        const newStack = prevStack.filter((id) => id !== windowId);
        newStack.push(windowId);
        return newStack;
      });
      setFocusedWindow(windowId);

      if (windowId === "genres") {
        if (genreMinimized) setGenreMinimized(false);
        setTimeout(() => document.querySelector("#genreName")?.focus(), 10);
      } else if (windowId === "wallpaper") {
        if (wallpaperMinimized) setWallpaperMinimized(false);
        setTimeout(
          () => document.querySelector('.window input[type="radio"]')?.focus(),
          10
        );
      } else if (windowId === "countries") {
        if (countryMinimized) setCountryMinimized(false);
        setTimeout(() => document.querySelector("#countryName")?.focus(), 10);
      } else if (windowId === "directors") {
        if (directorMinimized) setDirectorMinimized(false);
        setTimeout(() => document.querySelector("#directorName")?.focus(), 10);
      } else if (windowId === "actors") {
        if (actorMinimized) setActorMinimized(false);
        setTimeout(() => document.querySelector("#actorName")?.focus(), 10);
      } else if (windowId === "movies") {
        if (moviesMinimized) setMoviesMinimized(false);
      } else if (windowId === "backup") {
        if (backupMinimized) setBackupMinimized(false);
      } else if (windowId === "calculator") {
        if (calculatorMinimized) setCalculatorMinimized(false);
      } else if (windowId === "calendar") {
        if (calendarMinimized) setCalendarMinimized(false);
      } else if (windowId === "clock") {
        if (clockMinimized) setClockMinimized(false);
      } else if (windowId === "notepad") {
        if (notepadMinimized) setNotepadMinimized(false);
      }
    },
    [
      genreMinimized,
      wallpaperMinimized,
      countryMinimized,
      directorMinimized,
      actorMinimized,
      moviesMinimized,
      backupMinimized,
      calculatorMinimized,
      calendarMinimized,
      clockMinimized,
      notepadMinimized,
    ]
  );

  const memoizedOpenWindows = useMemo(
    () => [
      ...(genreWindowOpen
        ? [{ id: "genres", title: "Genres Manager", icon: "🎭" }]
        : []),
      ...(wallpaperWindowOpen
        ? [{ id: "wallpaper", title: "Wallpaper Settings", icon: "🎨" }]
        : []),
      ...(countryWindowOpen
        ? [{ id: "countries", title: "Countries Manager", icon: "🌍" }]
        : []),
      ...(directorWindowOpen
        ? [{ id: "directors", title: "Directors Manager", icon: "🎬" }]
        : []),
      ...(actorWindowOpen
        ? [{ id: "actors", title: "Actors Manager", icon: "🎭" }]
        : []),
      ...(moviesWindowOpen
        ? [{ id: "movies", title: "Movies Collection", icon: "🎬" }]
        : []),
      ...(backupWindowOpen
        ? [{ id: "backup", title: "Backup & Restore", icon: "💾" }]
        : []),
      ...(calculatorWindowOpen
        ? [{ id: "calculator", title: "Calculator", icon: "🔢" }]
        : []),
      ...(calendarWindowOpen
        ? [{ id: "calendar", title: "Calendar", icon: "📅" }]
        : []),
      ...(clockWindowOpen ? [{ id: "clock", title: "Clock", icon: "🕐" }] : []),
      ...(notepadWindowOpen
        ? [{ id: "notepad", title: "Notepad", icon: <img src={notepadIcon} alt="Notepad" style={{ width: "16px", height: "16px", verticalAlign: "middle" }} /> }]
        : []),
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
    ]
  );

  const allWindows = useMemo(
    () => [
      { id: "genres", title: "Genres Manager", icon: "🎭" },
      { id: "wallpaper", title: "Wallpaper Settings", icon: "🎨" },
      { id: "countries", title: "Countries Manager", icon: "🌍" },
      { id: "directors", title: "Directors Manager", icon: "🎬" },
      { id: "actors", title: "Actors Manager", icon: "🎭" },
      { id: "movies", title: "Movies Collection", icon: "🎬" },
      { id: "backup", title: "Backup & Restore", icon: "💾" },
      { id: "calculator", title: "Calculator", icon: "🔢" },
      { id: "calendar", title: "Calendar", icon: "📅" },
      { id: "clock", title: "Clock", icon: "🕐" },
      { id: "notepad", title: "Notepad", icon: <img src={notepadIcon} alt="Notepad" style={{ width: "16px", height: "16px", verticalAlign: "middle" }} /> },
    ],
    []
  );

  const openWindow = useCallback(
    (windowId) => {
      switch (windowId) {
        case "genres":
          setGenreWindowOpen(true);
          break;
        case "wallpaper":
          setWallpaperWindowOpen(true);
          break;
        case "countries":
          setCountryWindowOpen(true);
          break;
        case "directors":
          setDirectorWindowOpen(true);
          break;
        case "actors":
          setActorWindowOpen(true);
          break;
        case "movies":
          setMoviesWindowOpen(true);
          break;
        case "backup":
          setBackupWindowOpen(true);
          break;
        case "calculator":
          setCalculatorWindowOpen(true);
          break;
        case "calendar":
          setCalendarWindowOpen(true);
          break;
        case "clock":
          setClockWindowOpen(true);
          break;
        case "notepad":
          setNotepadWindowOpen(true);
          break;
        default:
          break;
      }
      handleWindowFocus(windowId);
    },
    [handleWindowFocus]
  );

  const closeWindow = useCallback((windowId) => {
    switch (windowId) {
      case "genres":
        setGenreWindowOpen(false);
        break;
      case "wallpaper":
        setWallpaperWindowOpen(false);
        break;
      case "countries":
        setCountryWindowOpen(false);
        break;
      case "directors":
        setDirectorWindowOpen(false);
        break;
      case "actors":
        setActorWindowOpen(false);
        break;
      case "movies":
        setMoviesWindowOpen(false);
        break;
      case "backup":
        setBackupWindowOpen(false);
        break;
      case "calculator":
        setCalculatorWindowOpen(false);
        break;
      case "calendar":
        setCalendarWindowOpen(false);
        break;
      case "clock":
        setClockWindowOpen(false);
        break;
      case "notepad":
        setNotepadWindowOpen(false);
        break;
      default:
        break;
    }
    setWindowStack((prevStack) => prevStack.filter((id) => id !== windowId));
  }, []);

  const handleCloseGenreWindow = useCallback(
    () => closeWindow("genres"),
    [closeWindow]
  );
  const handleMinimizeGenreWindow = useCallback(
    () => setGenreMinimized(true),
    []
  );

  const handleCloseWallpaperWindow = useCallback(
    () => closeWindow("wallpaper"),
    [closeWindow]
  );
  const handleMinimizeWallpaperWindow = useCallback(
    () => setWallpaperMinimized(true),
    []
  );

  const handleCloseCountryWindow = useCallback(
    () => closeWindow("countries"),
    [closeWindow]
  );
  const handleMinimizeCountryWindow = useCallback(
    () => setCountryMinimized(true),
    []
  );

  const handleCloseDirectorWindow = useCallback(
    () => closeWindow("directors"),
    [closeWindow]
  );
  const handleMinimizeDirectorWindow = useCallback(
    () => setDirectorMinimized(true),
    []
  );

  const handleCloseActorWindow = useCallback(
    () => closeWindow("actors"),
    [closeWindow]
  );
  const handleMinimizeActorWindow = useCallback(
    () => setActorMinimized(true),
    []
  );

  const handleCloseMoviesWindow = useCallback(
    () => closeWindow("movies"),
    [closeWindow]
  );
  const handleMinimizeMoviesWindow = useCallback(
    () => setMoviesMinimized(true),
    []
  );

  const handleCloseBackupWindow = useCallback(
    () => closeWindow("backup"),
    [closeWindow]
  );
  const handleMinimizeBackupWindow = useCallback(
    () => setBackupMinimized(true),
    []
  );

  const handleCloseCalculatorWindow = useCallback(
    () => closeWindow("calculator"),
    [closeWindow]
  );
  const handleMinimizeCalculatorWindow = useCallback(
    () => setCalculatorMinimized(true),
    []
  );

  const handleCloseCalendarWindow = useCallback(
    () => closeWindow("calendar"),
    [closeWindow]
  );
  const handleMinimizeCalendarWindow = useCallback(
    () => setCalendarMinimized(true),
    []
  );

  const handleCloseClockWindow = useCallback(
    () => closeWindow("clock"),
    [closeWindow]
  );
  const handleMinimizeClockWindow = useCallback(
    () => setClockMinimized(true),
    []
  );

  const handleCloseNotepadWindow = useCallback(
    () => closeWindow("notepad"),
    [closeWindow]
  );
  const handleMinimizeNotepadWindow = useCallback(
    () => setNotepadMinimized(true),
    []
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      // Ctrl/Cmd + M = Movies
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        openWindow("movies");
      }
      // Ctrl/Cmd + G = Genres
      else if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        openWindow("genres");
      }
      // Ctrl/Cmd + D = Directors
      else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        openWindow("directors");
      }
      // Ctrl/Cmd + Shift + A = Actors
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        openWindow("actors");
      }
      // Ctrl/Cmd + Shift + C = Countries
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        openWindow("countries");
      }
      // Ctrl/Cmd + B = Backup
      else if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        openWindow("backup");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openWindow]);

  return (
    <main className="container">
      <h1
        style={{
          color: "white",
          textAlign: "center",
          fontSize: "3rem",
          textShadow:
            "0 2px 4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        FilmTrack
      </h1>
      <p id="system-watermark">
        FilmTrack⁰⁶
        <br />
        Build 2100
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
            onFocus={() => handleWindowFocus("genres")}
            zIndex={100 + windowStack.indexOf("genres")}
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
            currentWallpaper={wallpaper}
            onWallpaperChange={handleWallpaperChange}
            onFocus={() => handleWindowFocus("wallpaper")}
            zIndex={100 + windowStack.indexOf("wallpaper")}
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
            onFocus={() => handleWindowFocus("countries")}
            zIndex={100 + windowStack.indexOf("countries")}
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
            onFocus={() => handleWindowFocus("directors")}
            zIndex={100 + windowStack.indexOf("directors")}
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
            onFocus={() => handleWindowFocus("actors")}
            zIndex={100 + windowStack.indexOf("actors")}
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
            onFocus={() => handleWindowFocus("movies")}
            zIndex={100 + windowStack.indexOf("movies")}
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
            onFocus={() => handleWindowFocus("backup")}
            zIndex={100 + windowStack.indexOf("backup")}
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
            onFocus={() => handleWindowFocus("calculator")}
            zIndex={100 + windowStack.indexOf("calculator")}
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
            onFocus={() => handleWindowFocus("calendar")}
            zIndex={100 + windowStack.indexOf("calendar")}
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
            onFocus={() => handleWindowFocus("clock")}
            zIndex={100 + windowStack.indexOf("clock")}
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
            onFocus={() => handleWindowFocus("notepad")}
            zIndex={100 + windowStack.indexOf("notepad")}
          />
        </Suspense>
      )}
      <Taskbar
        openWindows={memoizedOpenWindows}
        onWindowFocus={handleWindowFocus}
        onOpenWindow={openWindow}
        allWindows={allWindows}
        focusedWindow={focusedWindow}
      />
    </main>
  );
}

export default App;
