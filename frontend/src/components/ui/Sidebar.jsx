import PropTypes from 'prop-types';

const Sidebar = ({ onOpenGenres, onOpenWallpaper, onOpenCountries, onOpenDirectors, onOpenActors, onOpenMovies, onOpenBackup }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <button className="sidebar-btn" onClick={onOpenMovies}>
          🎬 Movies
        </button>
        <button className="sidebar-btn" onClick={onOpenGenres}>
          🎭 Genres
        </button>
        <button className="sidebar-btn" onClick={onOpenCountries}>
          🌍 Countries
        </button>
        <button className="sidebar-btn" onClick={onOpenDirectors}>
          🎬 Directors
        </button>
        <button className="sidebar-btn" onClick={onOpenActors}>
          🎭 Actors
        </button>
        <button className="sidebar-btn" onClick={onOpenWallpaper}>
          🎨 Wallpaper
        </button>
        <button className="sidebar-btn" onClick={onOpenBackup}>
          💾 Backup/Restore
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  onOpenGenres: PropTypes.func.isRequired,
  onOpenWallpaper: PropTypes.func.isRequired,
  onOpenCountries: PropTypes.func.isRequired,
  onOpenDirectors: PropTypes.func.isRequired,
  onOpenActors: PropTypes.func.isRequired,
  onOpenMovies: PropTypes.func.isRequired,
  onOpenBackup: PropTypes.func.isRequired
};

export default Sidebar;