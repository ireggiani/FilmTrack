import CountriesIcon from '../assets/icons/countries.png';
import DirectorsIcon from '../assets/icons/directors.png';
import ActorsIcon from '../assets/icons/actors.png';
import GenresIcon from '../assets/icons/genres.png';
import WallpaperIcon from '../assets/icons/wallpaper.png';
import MoviesIcon from '../assets/icons/movies.png';
import BackupIcon from '../assets/icons/backup.png';
import CalculatorIcon from '../assets/icons/calculator.png';
import CalendarIcon from '../assets/icons/calendar.png';
import ClockIcon from '../assets/icons/clock.png';
import notepadIcon from '../assets/icons/notepad-icon.png';

export const WINDOWS = [
  { id: 'movies', title: 'Movies Collection', icon: MoviesIcon },
  { id: 'genres', title: 'Genres Manager', icon: GenresIcon },
  { id: 'directors', title: 'Directors Manager', icon: DirectorsIcon },
  { id: 'actors', title: 'Actors Manager', icon: ActorsIcon },
  { id: 'countries', title: 'Countries Manager', icon: CountriesIcon },
  { id: 'backup', title: 'Backup & Restore', icon: BackupIcon },
  { id: 'wallpaper', title: 'Wallpaper Settings', icon: WallpaperIcon },
  { id: 'calculator', title: 'Calculator', icon: CalculatorIcon },
  { id: 'calendar', title: 'Calendar', icon: CalendarIcon },
  { id: 'clock', title: 'Clock', icon: ClockIcon },
  { id: 'notepad', title: 'Notepad', icon: notepadIcon },
];

export const WINDOW_MAP = Object.fromEntries(WINDOWS.map((w) => [w.id, w]));
