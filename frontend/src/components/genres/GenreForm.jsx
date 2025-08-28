import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const GenreForm = ({ onGenreAdded, existingGenres = [], editingGenre, onEditComplete }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const isEditing = !!editingGenre;

  useEffect(() => {
    if (editingGenre) {
      setName(editingGenre.name);
      setError('');
    } else {
      setName('');
    }
  }, [editingGenre]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();
    
    if (!isEditing) {
      const isDuplicate = existingGenres.some(genre => 
        genre.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        setError('Genre already exists');
        return;
      }
    }

    setError('');
    setLoading(true);
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/genres/${editingGenre.id}`
        : 'http://localhost:5000/api/genres';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      if (response.ok) {
        const genre = await response.json();
        setName('');
        if (isEditing) {
          onEditComplete?.();
        } else {
          onGenreAdded?.(genre);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} genre:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Genre' : 'Add New Genre'}</h2>
      {isEditing && (
        <button 
          type="button" 
          onClick={() => onEditComplete?.()} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.8rem', 
            cursor: 'pointer', 
            marginBottom: '1rem',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
          }}
        >
          ← Cancel Edit
        </button>
      )}
      <div className="form-group">
        <label htmlFor="genreName">Genre Name</label>
        <input
          ref={inputRef}
          id="genreName"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Enter genre name"
          disabled={loading}
        />
        {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
      </div>
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading || !name.trim()}
      >
        {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Genre' : 'Add Genre')}
      </button>
    </form>
  );
};

GenreForm.propTypes = {
  onGenreAdded: PropTypes.func,
  existingGenres: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })),
  editingGenre: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  onEditComplete: PropTypes.func
};

export default GenreForm;