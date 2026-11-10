import { lazy } from 'react';
import CountriesIcon from '../assets/icons/countries.png?icon';
import DirectorsIcon from '../assets/icons/directors.png?icon';
import ActorsIcon from '../assets/icons/actors.png?icon';
import GenresIcon from '../assets/icons/genres.png?icon';
import WallpaperIcon from '../assets/icons/wallpaper.png?icon';
import MoviesIcon from '../assets/icons/movies.png?icon';
import BackupIcon from '../assets/icons/backup.png?icon';
import CalculatorIcon from '../assets/icons/calculator.png?icon';
import CalendarIcon from '../assets/icons/calendar.png?icon';
import ClockIcon from '../assets/icons/clock.png?icon';
import notepadIcon from '../assets/icons/notepad.png?icon';
import StatsIcon from '../assets/icons/stats.png?icon'; // placeholder — replace with a dedicated icon
import PairsIcon from '../assets/icons/pairs.png?icon';
import HelpIcon from '../assets/icons/help.png?icon';
import DesktopIconsIcon from '../assets/icons/desktop-icons.png?icon';
import { iconSrc } from './icons';

// Everything App.jsx needs to run a window: `component` is what it renders, and
// `focusSelector` is a field to put the cursor in whenever the window is focused.
// Props only one window takes go in windowProps in App.jsx.
export const WINDOWS = [
  {
    id: 'movies',
    title: 'Movies Collection',
    icon: iconSrc(MoviesIcon),
    component: lazy(() => import('../components/movies/MoviesWindow')),
  },
  {
    id: 'genres',
    title: 'Genres Manager',
    icon: iconSrc(GenresIcon),
    component: lazy(() => import('../components/genres/GenreWindow')),
    focusSelector: '#genreName',
  },
  {
    id: 'directors',
    title: 'Directors Manager',
    icon: iconSrc(DirectorsIcon),
    component: lazy(() => import('../components/directors/DirectorWindow')),
    focusSelector: '#directorName',
  },
  {
    id: 'actors',
    title: 'Actors Manager',
    icon: iconSrc(ActorsIcon),
    component: lazy(() => import('../components/actors/ActorWindow')),
    focusSelector: '#actorName',
  },
  {
    id: 'countries',
    title: 'Countries Manager',
    icon: iconSrc(CountriesIcon),
    component: lazy(() => import('../components/countries/CountryWindow')),
    focusSelector: '[id^="countryName-"]',
  },
  {
    id: 'stats',
    title: 'Statistics',
    icon: iconSrc(StatsIcon),
    component: lazy(() => import('../components/stats/StatsWindow')),
  },
  {
    id: 'backup',
    title: 'Backup & Restore',
    icon: iconSrc(BackupIcon),
    component: lazy(() => import('../components/backup/BackupWindow')),
  },
  {
    id: 'wallpaper',
    title: 'Wallpaper Settings',
    icon: iconSrc(WallpaperIcon),
    component: lazy(() => import('../components/wallpapers/WallpaperWindow')),
    focusSelector: '.wallpaper-thumb.selected',
  },
  {
    id: 'desktopIcons',
    title: 'Desktop Icons',
    icon: iconSrc(DesktopIconsIcon),
    component: lazy(() => import('../components/desktop/DesktopIconsWindow')),
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: iconSrc(CalculatorIcon),
    component: lazy(() => import('../components/accessories/Calculator')),
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: iconSrc(CalendarIcon),
    component: lazy(() => import('../components/accessories/Calendar')),
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: iconSrc(ClockIcon),
    component: lazy(() => import('../components/accessories/Clock')),
  },
  {
    id: 'notepad',
    title: 'Notepad',
    icon: iconSrc(notepadIcon),
    component: lazy(() => import('../components/accessories/Notepad')),
  },
  {
    id: 'pairs',
    title: 'Poster Pairs',
    icon: iconSrc(PairsIcon),
    component: lazy(() => import('../components/games/PairsGame')),
  },
  {
    id: 'help',
    title: 'FilmTrack Help',
    icon: iconSrc(HelpIcon),
    component: lazy(() => import('../components/help/HelpWindow')),
  },
  // Opened from the Movies Collection poster column — needs a target movie,
  // so it's excluded from the start menu (startMenu: false).
  {
    id: 'posterViewer',
    title: 'Poster Viewer',
    icon: iconSrc(MoviesIcon),
    component: lazy(() => import('../components/movies/PosterViewerWindow')),
    startMenu: false,
  },
];

export const WINDOW_MAP = Object.fromEntries(WINDOWS.map((w) => [w.id, w]));

// Windows the user can launch directly from the start menu
export const START_MENU_WINDOWS = WINDOWS.filter((w) => w.startMenu !== false);

// Start menu folders, listed first and alphabetically, like the classic
// Windows "Programs" menu; their contents are sorted by title too. Windows
// not in a folder follow them, in WINDOWS order.
export const START_MENU_FOLDERS = [
  { name: 'Accessories', ids: ['calculator', 'calendar', 'clock', 'notepad'] },
  { name: 'Games', ids: ['pairs'] },
  { name: 'System', ids: ['wallpaper', 'desktopIcons', 'backup'] },
];

// Desktop icons shown until the user picks their own in the Desktop Icons
// window (saved in this browser). Display order: top→bottom, then left→right.
export const DEFAULT_DESKTOP_ICON_IDS = [
  'movies',
  'directors',
  'genres',
  'notepad',
  'help',
];
