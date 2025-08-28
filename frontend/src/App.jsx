import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from './components/ui/Sidebar'
import GenreWindow from './components/genres/GenreWindow'
import WallpaperWindow from './components/wallpapers/WallpaperWindow'
import CountryWindow from './components/countries/CountryWindow'
import DirectorWindow from './components/directors/DirectorWindow'
import ActorWindow from './components/actors/ActorWindow'
import MoviesWindow from './components/movies/MoviesWindow'
import Taskbar from './components/ui/Taskbar'
import './styles/globals.scss'
import './styles/windows.scss'
import './styles/scrollbar.scss'
import './styles/taskbar.scss'

function App() {
  const [refreshGenres, setRefreshGenres] = useState(0)
  const [refreshCountries, setRefreshCountries] = useState(0)
  const [refreshDirectors, setRefreshDirectors] = useState(0)
  const [refreshActors, setRefreshActors] = useState(0)
  const [refreshMovies, setRefreshMovies] = useState(0)
  const [wallpaper, setWallpaper] = useState(null)
  const [genres, setGenres] = useState([])
  const [countries, setCountries] = useState([])
  const [directors, setDirectors] = useState([])
  const [actors, setActors] = useState([])
  const [movies, setMovies] = useState([])
  const [genreWindowOpen, setGenreWindowOpen] = useState(false)
  const [wallpaperWindowOpen, setWallpaperWindowOpen] = useState(false)
  const [countryWindowOpen, setCountryWindowOpen] = useState(false)
  const [directorWindowOpen, setDirectorWindowOpen] = useState(false)
  const [actorWindowOpen, setActorWindowOpen] = useState(false)
  const [moviesWindowOpen, setMoviesWindowOpen] = useState(false)
  const [focusedWindow, setFocusedWindow] = useState(null)
  const [genreMinimized, setGenreMinimized] = useState(false)
  const [wallpaperMinimized, setWallpaperMinimized] = useState(false)
  const [countryMinimized, setCountryMinimized] = useState(false)
  const [directorMinimized, setDirectorMinimized] = useState(false)
  const [actorMinimized, setActorMinimized] = useState(false)
  const [moviesMinimized, setMoviesMinimized] = useState(false)
  
  const handleGenreAdded = useCallback(() => {
    setRefreshGenres(prev => prev + 1)
  }, [])

  const handleGenresLoaded = useCallback((loadedGenres) => {
    setGenres(loadedGenres)
  }, [])

  const handleCountryAdded = useCallback(() => {
    setRefreshCountries(prev => prev + 1)
  }, [])

  const handleCountriesLoaded = useCallback((loadedCountries) => {
    setCountries(loadedCountries)
  }, [])

  const handleDirectorAdded = useCallback(() => {
    setRefreshDirectors(prev => prev + 1)
  }, [])

  const handleDirectorsLoaded = useCallback((loadedDirectors) => {
    setDirectors(loadedDirectors)
  }, [])

  const handleActorAdded = useCallback(() => {
    setRefreshActors(prev => prev + 1)
  }, [])

  const handleActorsLoaded = useCallback((loadedActors) => {
    setActors(loadedActors)
  }, [])

  const handleMoviesLoaded = useCallback((loadedMovies) => {
    setMovies(loadedMovies)
  }, [])

  const handleWallpaperChange = useCallback((imageUrl) => {
    setWallpaper(imageUrl)
    
    if (imageUrl) {
      localStorage.setItem('filmtrack-wallpaper', imageUrl)
      document.body.style.backgroundImage = `url(${imageUrl})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
    } else {
      localStorage.removeItem('filmtrack-wallpaper')
      document.body.style.backgroundImage = ''
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('filmtrack-wallpaper')
    if (saved && saved !== '') {
      setWallpaper(saved)
      document.body.style.backgroundImage = `url(${saved})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
    } else {
      document.body.style.backgroundImage = ''
    }
  }, [])

  const handleWindowFocus = useCallback((windowId) => {
    if (windowId === 'genres') {
      if (genreMinimized) {
        setGenreMinimized(false);
      }
      setFocusedWindow(windowId);
      setTimeout(() => {
        const input = document.querySelector('#genreName');
        input?.focus();
      }, 10);
    } else if (windowId === 'wallpaper') {
      if (wallpaperMinimized) {
        setWallpaperMinimized(false);
      }
      setFocusedWindow(windowId);
      setTimeout(() => {
        const firstButton = document.querySelector('.glass-window input[type="radio"]');
        firstButton?.focus();
      }, 10);
    } else if (windowId === 'countries') {
      if (countryMinimized) {
        setCountryMinimized(false);
      }
      setFocusedWindow(windowId);
      setTimeout(() => {
        const input = document.querySelector('#countryName');
        input?.focus();
      }, 10);
    } else if (windowId === 'directors') {
      if (directorMinimized) {
        setDirectorMinimized(false);
      }
      setFocusedWindow(windowId);
      setTimeout(() => {
        const input = document.querySelector('#directorName');
        input?.focus();
      }, 10);
    } else if (windowId === 'actors') {
      if (actorMinimized) {
        setActorMinimized(false);
      }
      setFocusedWindow(windowId);
      setTimeout(() => {
        const input = document.querySelector('#actorName');
        input?.focus();
      }, 10);
    } else if (windowId === 'movies') {
      if (moviesMinimized) {
        setMoviesMinimized(false);
      }
      setFocusedWindow(windowId);
    } 
  }, [genreMinimized, wallpaperMinimized, countryMinimized, directorMinimized, actorMinimized, moviesMinimized])

  const memoizedOpenWindows = useMemo(() => [
    ...(genreWindowOpen ? [{ id: 'genres', title: 'Genres Manager', icon: '🎭' }] : []),
    ...(wallpaperWindowOpen ? [{ id: 'wallpaper', title: 'Wallpaper Settings', icon: '🎨' }] : []),
    ...(countryWindowOpen ? [{ id: 'countries', title: 'Countries Manager', icon: '🌍' }] : [] ),
    ...(directorWindowOpen ? [{ id: 'directors', title: 'Directors Manager', icon: '🎬' }] : []),
    ...(actorWindowOpen ? [{ id: 'actors', title: 'Actors Manager', icon: '🎭' }] : []),
    ...(moviesWindowOpen ? [{ id: 'movies', title: 'Movies Collection', icon: '🎬' }] : [])
  ], [genreWindowOpen, wallpaperWindowOpen, countryWindowOpen, directorWindowOpen, actorWindowOpen, moviesWindowOpen]);

  const handleOpenGenres = useCallback(() => {
    setGenreWindowOpen(true);
    setFocusedWindow('genres');
  }, []);

  const handleOpenWallpaper = useCallback(() => {
    setWallpaperWindowOpen(true);
    setFocusedWindow('wallpaper');
  }, []);

  const handleOpenCountries = useCallback(() => {
    setCountryWindowOpen(true);
    setFocusedWindow('countries');
  }, []);

  const handleOpenDirectors = useCallback(() => {
    setDirectorWindowOpen(true);
    setFocusedWindow('directors');
  }, []);

  const handleOpenActors = useCallback(() => {
    setActorWindowOpen(true);
    setFocusedWindow('actors');
  }, []);

  const handleOpenMovies = useCallback(() => {
    setMoviesWindowOpen(true);
    setFocusedWindow('movies');
  }, []);

  const handleCloseGenreWindow = useCallback(() => setGenreWindowOpen(false), []);
  const handleMinimizeGenreWindow = useCallback(() => setGenreMinimized(true), []);

  const handleCloseWallpaperWindow = useCallback(() => setWallpaperWindowOpen(false), []);
  const handleMinimizeWallpaperWindow = useCallback(() => setWallpaperMinimized(true), []);

  const handleCloseCountryWindow = useCallback(() => setCountryWindowOpen(false), []);
  const handleMinimizeCountryWindow = useCallback(() => setCountryMinimized(true), []);

  const handleCloseDirectorWindow = useCallback(() => setDirectorWindowOpen(false), []);
  const handleMinimizeDirectorWindow = useCallback(() => setDirectorMinimized(true), []);

  const handleCloseActorWindow = useCallback(() => setActorWindowOpen(false), []);
  const handleMinimizeActorWindow = useCallback(() => setActorMinimized(true), []);

  const handleCloseMoviesWindow = useCallback(() => setMoviesWindowOpen(false), []);
  const handleMinimizeMoviesWindow = useCallback(() => setMoviesMinimized(true), []);


  return (
    <div className="container">
      <h1 style={{ 
        color: 'white', 
        textAlign: 'center', 
        fontSize: '3rem',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.3)'
      }}>
        FilmTrack
      </h1>
      <Sidebar 
        onOpenGenres={handleOpenGenres}
        onOpenWallpaper={handleOpenWallpaper}
        onOpenCountries={handleOpenCountries}
        onOpenDirectors={handleOpenDirectors}
        onOpenActors={handleOpenActors}
        onOpenMovies={handleOpenMovies}
      />
      <GenreWindow 
        isOpen={genreWindowOpen}
        isMinimized={genreMinimized}
        onClose={handleCloseGenreWindow}
        onMinimize={handleMinimizeGenreWindow}
        genres={genres}
        onGenreAdded={handleGenreAdded}
        onGenresLoaded={handleGenresLoaded}
        refreshGenres={refreshGenres}
        onFocus={() => setFocusedWindow('genres')}
        zIndex={focusedWindow === 'genres' ? 250 : 200}
      />
      <WallpaperWindow
        isOpen={wallpaperWindowOpen}
        isMinimized={wallpaperMinimized}
        onClose={handleCloseWallpaperWindow}
        onMinimize={handleMinimizeWallpaperWindow}
        currentWallpaper={wallpaper}
        onWallpaperChange={handleWallpaperChange}
        onFocus={() => setFocusedWindow('wallpaper')}
        zIndex={focusedWindow === 'wallpaper' ? 250 : 200}
      />
      <CountryWindow 
        isOpen={countryWindowOpen}
        isMinimized={countryMinimized}
        onClose={handleCloseCountryWindow}
        onMinimize={handleMinimizeCountryWindow}
        countries={countries}
        onCountryAdded={handleCountryAdded}
        onCountriesLoaded={handleCountriesLoaded}
        refreshCountries={refreshCountries}
        onFocus={() => setFocusedWindow('countries')}
        zIndex={focusedWindow === 'countries' ? 250 : 200}
      />
      <DirectorWindow 
        isOpen={directorWindowOpen}
        isMinimized={directorMinimized}
        onClose={handleCloseDirectorWindow}
        onMinimize={handleMinimizeDirectorWindow}
        directors={directors}
        onDirectorAdded={handleDirectorAdded}
        onDirectorsLoaded={handleDirectorsLoaded}
        refreshDirectors={refreshDirectors}
        onFocus={() => setFocusedWindow('directors')}
        zIndex={focusedWindow === 'directors' ? 250 : 200}
      />
      <ActorWindow 
        isOpen={actorWindowOpen}
        isMinimized={actorMinimized}
        onClose={handleCloseActorWindow}
        onMinimize={handleMinimizeActorWindow}
        actors={actors}
        onActorAdded={handleActorAdded}
        onActorsLoaded={handleActorsLoaded}
        refreshActors={refreshActors}
        onFocus={() => setFocusedWindow('actors')}
        zIndex={focusedWindow === 'actors' ? 250 : 200}
      />
      <MoviesWindow 
        isOpen={moviesWindowOpen}
        isMinimized={moviesMinimized}
        onClose={handleCloseMoviesWindow}
        onMinimize={handleMinimizeMoviesWindow}
        movies={movies}
        onMoviesLoaded={handleMoviesLoaded}
        refreshMovies={refreshMovies}
        onFocus={() => setFocusedWindow('movies')}
        zIndex={focusedWindow === 'movies' ? 250 : 200}
      />
      <Taskbar 
        openWindows={memoizedOpenWindows}
        onWindowFocus={handleWindowFocus}
      />
    </div>
  )
}

export default App