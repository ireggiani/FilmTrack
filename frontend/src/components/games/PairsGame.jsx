import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import WindowIcon from '../ui/WindowIcon';
import API_BASE_URL from '../../config/api.js';
import '../../styles/games/_pairs.scss';

const MAX_PAIRS = 8;
const MIN_PAIRS = 2;
const UNFLIP_DELAY = 900;

const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const PairsGame = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const unflipTimer = useRef(null);
  const [pool, setPool] = useState(null); // movies with posters; null = loading
  const [fetchError, setFetchError] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indices of face-up unmatched cards (max 2)
  const [matched, setMatched] = useState(new Set()); // movieIds
  const [moves, setMoves] = useState(0);

  const dealCards = useCallback((posterMovies) => {
    const chosen = shuffle(posterMovies).slice(0, MAX_PAIRS);
    const deck = shuffle(
      chosen.flatMap((movie) => [
        { key: `${movie.id}-a`, movieId: movie.id, title: movie.title, thumbUrl: movie.posterThumbUrl },
        { key: `${movie.id}-b`, movieId: movie.id, title: movie.title, thumbUrl: movie.posterThumbUrl },
      ])
    );
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    clearTimeout(unflipTimer.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPool(null);
    setFetchError(null);
    fetch(`${API_BASE_URL}/movies`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load movies');
        return r.json();
      })
      .then((movies) => {
        const withPosters = movies.filter((m) => m.posterThumbUrl);
        setPool(withPosters);
        dealCards(withPosters);
      })
      .catch((err) => setFetchError(err.message));
  }, [isOpen, dealCards]);

  useEffect(() => () => clearTimeout(unflipTimer.current), []);

  const handleCardClick = (index) => {
    const card = cards[index];
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.has(card.movieId)
    ) {
      return;
    }

    const nowFlipped = [...flipped, index];
    setFlipped(nowFlipped);

    if (nowFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = nowFlipped.map((i) => cards[i]);
      if (first.movieId === second.movieId) {
        setMatched((prev) => new Set(prev).add(first.movieId));
        setFlipped([]);
      } else {
        unflipTimer.current = setTimeout(() => setFlipped([]), UNFLIP_DELAY);
      }
    }
  };

  if (!isOpen) return null;

  const totalPairs = cards.length / 2;
  const hasWon = totalPairs > 0 && matched.size === totalPairs;
  const canPlay = pool && pool.length >= MIN_PAIRS;

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window pairs-window"
        onClick={onFocus}
        style={{ zIndex, ...(isMinimized ? { display: 'none' } : {}) }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Poster Pairs" />
            </span>
            <span className="window-title">Poster Pairs</span>
          </div>
          <div className="titlebar-right">
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>

        <div className="window-content pairs-content">
          {!pool && !fetchError && (
            <p className="pairs-message">Shuffling the deck…</p>
          )}
          {fetchError && (
            <p className="pairs-message pairs-message--error">
              ❌ {fetchError}
            </p>
          )}
          {pool && !canPlay && (
            <p className="pairs-message">
              🎬 Poster Pairs needs at least {MIN_PAIRS} movies with posters.
              Add some posters in the Movies Collection and come back!
            </p>
          )}

          {canPlay && (
            <>
              <div className="pairs-toolbar">
                <span className="pairs-stat">
                  Pairs: {matched.size}/{totalPairs}
                </span>
                <span className="pairs-stat">Moves: {moves}</span>
                <button
                  className="pairs-new-btn"
                  onClick={() => dealCards(pool)}
                >
                  New Game
                </button>
              </div>

              <div className="pairs-grid">
                {cards.map((card, index) => {
                  const isFaceUp =
                    flipped.includes(index) || matched.has(card.movieId);
                  return (
                    <button
                      key={card.key}
                      className={`pairs-card${isFaceUp ? ' face-up' : ''}${
                        matched.has(card.movieId) ? ' matched' : ''
                      }`}
                      onClick={() => handleCardClick(index)}
                      title={matched.has(card.movieId) ? card.title : undefined}
                    >
                      <span className="pairs-card-inner">
                        <span className="pairs-card-back">🎬</span>
                        <span className="pairs-card-front">
                          <img
                            src={card.thumbUrl}
                            alt={
                              matched.has(card.movieId) ? card.title : 'Poster'
                            }
                            draggable={false}
                          />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasWon && (
                <div className="pairs-win">
                  <div className="pairs-win-panel">
                    <span className="pairs-win-title">🏆 You win!</span>
                    <span className="pairs-win-detail">
                      {totalPairs} pairs in {moves} moves
                    </span>
                    <button
                      className="pairs-new-btn"
                      onClick={() => dealCards(pool)}
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
};

PairsGame.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
};

export default PairsGame;
