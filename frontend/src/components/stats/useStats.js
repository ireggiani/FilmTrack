import { useMemo } from 'react';

// rating is stored as DataTypes.STRING in the DB, so all values arrive as
// strings. Also handles the edge case of comma decimal separators ("7,5").
const parseRating = r => {
  if (r == null) return null;
  const n = parseFloat(String(r).replace(',', '.'));
  return isFinite(n) ? n : null;
};

export function useStats(movies) {
  const moviesByGenre = useMemo(() => {
    const counts = {};
    movies.forEach(m => m.Genres?.forEach(g => {
      counts[g.name] = (counts[g.name] || 0) + 1;
    }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [movies]);

  const moviesByCountry = useMemo(() => {
    const counts = {};
    movies.forEach(m => m.Countries?.forEach(c => {
      counts[c.name] = (counts[c.name] || 0) + 1;
    }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [movies]);

  const ratingDistribution = useMemo(() => {
    const buckets = {};
    for (let i = 1; i <= 10; i++) buckets[i] = 0;
    movies.forEach(m => {
      const r = parseRating(m.rating);
      if (r !== null) {
        const bucket = Math.min(10, Math.max(1, Math.round(r)));
        buckets[bucket]++;
      }
    });
    return Object.entries(buckets).map(([rating, count]) => ({ rating: `${rating}★`, count }));
  }, [movies]);

  const avgRatingByGenre = useMemo(() => {
    const data = {};
    movies.forEach(m => {
      const r = parseRating(m.rating);
      if (r === null) return;
      m.Genres?.forEach(g => {
        if (!data[g.name]) data[g.name] = { sum: 0, count: 0 };
        data[g.name].sum += r;
        data[g.name].count++;
      });
    });
    return Object.entries(data)
      .filter(([, { count }]) => count >= 2)
      .map(([name, { sum, count }]) => ({
        name,
        avgRating: Math.round((sum / count) * 10) / 10,
        count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
  }, [movies]);

  const topDirectors = useMemo(() => {
    const counts = {};
    movies.forEach(m => m.Directors?.forEach(d => {
      counts[d.name] = (counts[d.name] || 0) + 1;
    }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [movies]);

  const topActors = useMemo(() => {
    const counts = {};
    movies.forEach(m => m.Actors?.forEach(a => {
      counts[a.name] = (counts[a.name] || 0) + 1;
    }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [movies]);

  const ratingVsYear = useMemo(() => {
    return movies
      .filter(m => m.releaseYear && parseRating(m.rating) !== null)
      .map(m => ({ x: m.releaseYear, y: parseRating(m.rating), label: m.title }));
  }, [movies]);

  const summary = useMemo(() => {
    const ratings = movies.map(m => parseRating(m.rating)).filter(r => r !== null);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : null;
    const topGenre = moviesByGenre[0]?.name ?? '—';
    const uniqueDirectors = new Set(movies.flatMap(m => m.Directors?.map(d => d.id) ?? [])).size;
    const uniqueActors = new Set(movies.flatMap(m => m.Actors?.map(a => a.id) ?? [])).size;
    return { total: movies.length, avgRating, topGenre, uniqueDirectors, uniqueActors };
  }, [movies, moviesByGenre]);

  return {
    moviesByGenre,
    moviesByCountry,
    ratingDistribution,
    avgRatingByGenre,
    topDirectors,
    topActors,
    ratingVsYear,
    summary,
  };
}
