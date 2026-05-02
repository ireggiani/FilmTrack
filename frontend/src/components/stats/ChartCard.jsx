import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChartCard = ({ title, types, children, wide }) => {
  const [chartType, setChartType] = useState(types[0].key);
  const [isReady, setIsReady] = useState(false);

  // Defer first render by one frame so the spinner appears before the SVG paints.
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // When toggling chart type, briefly show spinner while the new chart renders.
  const handleToggle = (key) => {
    if (key === chartType) return;
    setIsReady(false);
    setChartType(key);
    requestAnimationFrame(() => setIsReady(true));
  };

  return (
    <div className={`stats-card${wide ? ' stats-card--wide' : ''}`}>
      <div className="stats-card__header">
        <h3 className="stats-card__title">{title}</h3>
        {types.length > 1 && (
          <div className="stats-card__toggles">
            {types.map(t => (
              <button
                key={t.key}
                className={`stats-card__toggle${chartType === t.key ? ' active' : ''}`}
                onClick={() => handleToggle(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="stats-card__body">
        {isReady
          ? children(chartType)
          : (
            <div className="stats-card__loading">
              <div className="stats-card__spinner" />
            </div>
          )
        }
      </div>
    </div>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  children: PropTypes.func.isRequired,
  wide: PropTypes.bool,
};

export default ChartCard;
