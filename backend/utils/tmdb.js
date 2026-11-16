const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Only real TMDB poster paths pass: "/<alphanumeric>.jpg" — keeps the download
// endpoint from being steered anywhere else on disk or the network.
const POSTER_PATH_RE = /^\/[A-Za-z0-9]+\.(jpg|png)$/;

function isConfigured() {
  return Boolean(process.env.TMDB_API_KEY);
}

// v4 Read Access Tokens are JWTs (contain dots) and go in the Authorization
// header; classic v3 keys are appended as a query param.
function authorize(url) {
  const key = process.env.TMDB_API_KEY;
  if (key.includes('.')) {
    return { url, headers: { Authorization: `Bearer ${key}` } };
  }
  const withKey = new URL(url);
  withKey.searchParams.set('api_key', key);
  return { url: withKey.toString(), headers: {} };
}

// What differs between TMDB's movie and TV searches: the endpoint, the year
// filter, and the names of the title and date fields
const SEARCH_TYPES = {
  movie: { endpoint: 'search/movie', yearParam: 'year', title: 'title', date: 'release_date' },
  tv: { endpoint: 'search/tv', yearParam: 'first_air_date_year', title: 'name', date: 'first_air_date' }
};

// Search for movies, or TV shows with type 'tv' (series, mini-series, anime)
async function search(query, year, type = 'movie') {
  const kind = SEARCH_TYPES[type] || SEARCH_TYPES.movie;
  const searchUrl = new URL(`${TMDB_API_BASE}/${kind.endpoint}`);
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('include_adult', 'false');
  if (year) searchUrl.searchParams.set(kind.yearParam, year);

  const { url, headers } = authorize(searchUrl.toString());
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`TMDB search failed (HTTP ${response.status})`);
  }
  const data = await response.json();

  return (data.results || [])
    .filter((result) => result.poster_path)
    .map((result) => ({
      tmdbId: result.id,
      title: result[kind.title],
      year: result[kind.date] ? parseInt(result[kind.date].slice(0, 4), 10) : null,
      posterPath: result.poster_path,
      thumbUrl: `${TMDB_IMAGE_BASE}/w185${result.poster_path}`
    }));
}

// Download the full-quality poster; returns { buffer, ext }
async function downloadPoster(posterPath) {
  if (!POSTER_PATH_RE.test(posterPath)) {
    const err = new Error('Invalid poster path');
    err.badRequest = true;
    throw err;
  }
  const response = await fetch(`${TMDB_IMAGE_BASE}/original${posterPath}`, {
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) {
    throw new Error(`TMDB image download failed (HTTP ${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = posterPath.endsWith('.png') ? 'png' : 'jpg';
  return { buffer, ext };
}

module.exports = { isConfigured, search, downloadPoster };
