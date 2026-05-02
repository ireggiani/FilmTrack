import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
} from 'recharts';
import { useStats } from './useStats';
import ChartCard from './ChartCard';
import WindowIcon from '../ui/WindowIcon';
import API_BASE_URL from '../../config/api.js';
import '../../styles/windows/_stats.scss';

const PALETTE = [
  '#4a9eff', '#ff6b6b', '#51cf66', '#ffd43b',
  '#cc5de8', '#ff922b', '#20c997', '#f06595',
  '#74c0fc', '#a9e34b', '#e599f7', '#ffa94d',
];

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 25, 45, 0.92)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '6px',
  color: '#d8eaff',
  fontSize: '0.75rem',
};
const TOOLTIP_ITEM_STYLE = { color: '#d8eaff' };

const AXIS_TICK = { fill: 'rgba(0,0,0,0.55)', fontSize: 11 };
const GRID_STROKE = 'rgba(0, 0, 0, 0.08)';

const truncate = (str, n = 18) => str.length > n ? `${str.slice(0, n - 1)}…` : str;

// Custom scatter dot tooltip
const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { x, y, label } = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p style={{ marginBottom: 2, fontWeight: 600 }}>{label}</p>
      <p>Year: {x} &nbsp;|&nbsp; Rating: {y}</p>
    </div>
  );
};

const StatsWindow = ({ isOpen, isMinimized, onClose, onMinimize, onFocus, zIndex, icon }) => {
  const nodeRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setFetchError(null);
    fetch(`${API_BASE_URL}/movies`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then(data => { setMovies(data); setLoading(false); })
      .catch(err => { setFetchError(err.message); setLoading(false); });
  }, [isOpen]);

  const { moviesByGenre, moviesByCountry, ratingDistribution, avgRatingByGenre, topDirectors, topActors, ratingVsYear, summary } = useStats(movies);

  if (!isOpen) return null;

  const windowStyle = isMaximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', maxWidth: '100vw', height: 'calc(100vh - 32px)', maxHeight: 'calc(100vh - 32px)', borderRadius: 0, zIndex: 300 }
    : { zIndex };
  const contentStyle = isMaximized
    ? { maxHeight: 'calc(100vh - 64px)', height: 'calc(100vh - 64px)' }
    : {};

  return (
    <Draggable handle=".window-titlebar" bounds="parent" nodeRef={nodeRef} disabled={isMaximized} cancel=".titlebar-button">
      <div
        ref={nodeRef}
        className={`window window--stats${isMaximized ? ' maximized' : ''}`}
        onClick={onFocus}
        style={{ ...windowStyle, ...(isMinimized ? { display: 'none' } : {}) }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span onDoubleClick={onClose} title="Double-click to close" className="window-icon-container">
              <WindowIcon icon={icon} alt="Statistics" />
            </span>
            <span className="window-title">Statistics</span>
          </div>
          <div className="titlebar-right">
            <button className="titlebar-button window-minimize paddle-switch" onClick={onMinimize} title="Minimize">🗕</button>
            <button
              className={`titlebar-button window-maximize paddle-switch${isMaximized ? ' active' : ''}`}
              onClick={() => setIsMaximized(m => !m)}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button className="titlebar-button window-close paddle-switch" onClick={onClose}>🗙</button>
          </div>
        </div>

        <div className="window-content stats-window" style={contentStyle}>
          {loading && <div className="stats-loading"><div className="stats-card__spinner" /><span>Loading statistics…</span></div>}
          {fetchError && <div className="stats-loading stats-loading--error">Failed to load data: {fetchError}</div>}

          {!loading && !fetchError && (
            <>
              {/* Summary strip */}
              <div className="stats-summary">
                <div className="stats-summary__item"><span className="stats-summary__value">{summary.total}</span><span className="stats-summary__label">Movies</span></div>
                <div className="stats-summary__item"><span className="stats-summary__value">{summary.avgRating ?? '—'}</span><span className="stats-summary__label">Avg Rating</span></div>
                <div className="stats-summary__item"><span className="stats-summary__value">{summary.topGenre}</span><span className="stats-summary__label">Top Genre</span></div>
                <div className="stats-summary__item"><span className="stats-summary__value">{summary.uniqueDirectors}</span><span className="stats-summary__label">Directors</span></div>
                <div className="stats-summary__item"><span className="stats-summary__value">{summary.uniqueActors}</span><span className="stats-summary__label">Actors</span></div>
              </div>

              <div className="stats-grid">

                {/* Movies by Genre */}
                <ChartCard title="Movies by Genre" types={[{ key: 'bar', label: 'Bar' }, { key: 'pie', label: 'Pie' }]}>
                  {type => (
                    <ResponsiveContainer width="100%" height={Math.max(220, moviesByGenre.length * 28)}>
                      {type === 'bar' ? (
                        <BarChart layout="vertical" data={moviesByGenre} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                          <YAxis type="category" dataKey="name" width={130} tick={AXIS_TICK} tickFormatter={n => truncate(n)} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar dataKey="count" name="Movies" fill={PALETTE[0]} radius={[0, 3, 3, 0]} />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie data={moviesByGenre} dataKey="count" nameKey="name" cx="50%" cy="45%" outerRadius={90} label={({ name, percent }) => `${truncate(name, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {moviesByGenre.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                          <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.6)' }} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Movies by Country */}
                <ChartCard title="Movies by Country" types={[{ key: 'bar', label: 'Bar' }, { key: 'pie', label: 'Pie' }]}>
                  {type => (
                    <ResponsiveContainer width="100%" height={Math.max(220, moviesByCountry.length * 28)}>
                      {type === 'bar' ? (
                        <BarChart layout="vertical" data={moviesByCountry} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                          <YAxis type="category" dataKey="name" width={130} tick={AXIS_TICK} tickFormatter={n => truncate(n)} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar dataKey="count" name="Movies" fill={PALETTE[2]} radius={[0, 3, 3, 0]} />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie data={moviesByCountry} dataKey="count" nameKey="name" cx="50%" cy="45%" outerRadius={90} label={({ name, percent }) => `${truncate(name, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {moviesByCountry.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                          <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.6)' }} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Average Rating by Genre */}
                <ChartCard title="Avg Rating by Genre" types={[{ key: 'bar', label: 'Bar' }, { key: 'radar', label: 'Radar' }]}>
                  {type => (
                    <ResponsiveContainer width="100%" height={Math.max(220, type === 'bar' ? avgRatingByGenre.length * 30 : 280)}>
                      {type === 'bar' ? (
                        <BarChart layout="vertical" data={avgRatingByGenre} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                          <XAxis type="number" domain={[0, 10]} tick={AXIS_TICK} />
                          <YAxis type="category" dataKey="name" width={130} tick={AXIS_TICK} tickFormatter={n => truncate(n)} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(v, _, props) => [`${v} (${props.payload.count} films)`, 'Avg Rating']} />
                          <Bar dataKey="avgRating" name="Avg Rating" fill={PALETTE[3]} radius={[0, 3, 3, 0]} />
                        </BarChart>
                      ) : (
                        <RadarChart data={avgRatingByGenre.slice(0, 10)} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke={GRID_STROKE} />
                          <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10 }} tickFormatter={n => truncate(n, 12)} />
                          <PolarRadiusAxis domain={[0, 10]} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 9 }} tickCount={6} />
                          <Radar dataKey="avgRating" stroke={PALETTE[3]} fill={PALETTE[3]} fillOpacity={0.28} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} formatter={v => [`${v}`, 'Avg Rating']} />
                        </RadarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Rating Distribution */}
                <ChartCard title="Rating Distribution" types={[{ key: 'bar', label: 'Bar' }]}>
                  {() => (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={ratingDistribution} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                        <XAxis dataKey="rating" tick={AXIS_TICK} />
                        <YAxis allowDecimals={false} tick={AXIS_TICK} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" name="Movies" radius={[3, 3, 0, 0]}>
                          {ratingDistribution.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Top Directors */}
                <ChartCard title="Top Directors" types={[{ key: 'bar', label: 'Bar' }]}>
                  {() => (
                    <ResponsiveContainer width="100%" height={Math.max(200, topDirectors.length * 28)}>
                      <BarChart layout="vertical" data={topDirectors} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                        <YAxis type="category" dataKey="name" width={140} tick={AXIS_TICK} tickFormatter={n => truncate(n, 20)} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" name="Movies" fill={PALETTE[4]} radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Top Actors */}
                <ChartCard title="Top Actors" types={[{ key: 'bar', label: 'Bar' }]}>
                  {() => (
                    <ResponsiveContainer width="100%" height={Math.max(200, topActors.length * 28)}>
                      <BarChart layout="vertical" data={topActors} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                        <YAxis type="category" dataKey="name" width={140} tick={AXIS_TICK} tickFormatter={n => truncate(n, 20)} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="count" name="Movies" fill={PALETTE[5]} radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Rating vs Release Year — full width */}
                <ChartCard title="Rating vs. Release Year" types={[{ key: 'scatter', label: 'Scatter' }]} wide>
                  {() => (
                    <ResponsiveContainer width="100%" height={280}>
                      <ScatterChart margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                        <XAxis dataKey="x" name="Year" type="number" domain={['auto', 'auto']} tick={AXIS_TICK} label={{ value: 'Release Year', position: 'insideBottom', offset: -2, fill: 'rgba(0,0,0,0.45)', fontSize: 11 }} />
                        <YAxis dataKey="y" name="Rating" domain={[0, 10]} tick={AXIS_TICK} label={{ value: 'Rating', angle: -90, position: 'insideLeft', fill: 'rgba(0,0,0,0.45)', fontSize: 11 }} />
                        <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.3)' }} />
                        <Scatter data={ratingVsYear} fill={PALETTE[0]} fillOpacity={0.55} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

              </div>
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
};

StatsWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
};

export default StatsWindow;
