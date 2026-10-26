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

export const WINDOWS = [
  { id: 'movies', title: 'Movies Collection', icon: iconSrc(MoviesIcon) },
  { id: 'genres', title: 'Genres Manager', icon: iconSrc(GenresIcon) },
  { id: 'directors', title: 'Directors Manager', icon: iconSrc(DirectorsIcon) },
  { id: 'actors', title: 'Actors Manager', icon: iconSrc(ActorsIcon) },
  { id: 'countries', title: 'Countries Manager', icon: iconSrc(CountriesIcon) },
  { id: 'stats', title: 'Statistics', icon: iconSrc(StatsIcon) },
  { id: 'backup', title: 'Backup & Restore', icon: iconSrc(BackupIcon) },
  { id: 'wallpaper', title: 'Wallpaper Settings', icon: iconSrc(WallpaperIcon) },
  { id: 'desktopIcons', title: 'Desktop Icons', icon: iconSrc(DesktopIconsIcon) },
  { id: 'calculator', title: 'Calculator', icon: iconSrc(CalculatorIcon) },
  { id: 'calendar', title: 'Calendar', icon: iconSrc(CalendarIcon) },
  { id: 'clock', title: 'Clock', icon: iconSrc(ClockIcon) },
  { id: 'notepad', title: 'Notepad', icon: iconSrc(notepadIcon) },
  { id: 'pairs', title: 'Poster Pairs', icon: iconSrc(PairsIcon) },
  { id: 'help', title: 'FilmTrack Help', icon: iconSrc(HelpIcon) },
  // Opened from the Movies Collection poster column — needs a target movie,
  // so it's excluded from the start menu (startMenu: false).
  {
    id: 'posterViewer',
    title: 'Poster Viewer',
    icon: iconSrc(MoviesIcon),
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
