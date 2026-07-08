const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const POSTERS_DIR = path.join(__dirname, '..', 'uploads', 'posters');
const THUMBS_DIR = path.join(POSTERS_DIR, 'thumbs');
// 2x the 200px hover-preview display size, crisp on hidpi screens
const THUMB_WIDTH = 400;

// Ensure the poster directories exist on load
fs.mkdirSync(THUMBS_DIR, { recursive: true });

// Extensions we store, derived from validated mimetypes — never from client filenames
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Read the posters directory and return Map<movieId (number), filename>
function getPosterMap() {
  const map = new Map();
  for (const file of fs.readdirSync(POSTERS_DIR)) {
    const match = file.match(/^(\d+)\.(jpg|png|webp)$/);
    if (match) map.set(parseInt(match[1], 10), file);
  }
  return map;
}

// Build the public URLs for a poster file, with an mtime cache-buster derived
// from the original (so replacing a poster busts the thumb URL too).
function buildPosterUrls(filename) {
  const { mtimeMs } = fs.statSync(path.join(POSTERS_DIR, filename));
  const version = Math.round(mtimeMs);
  return {
    posterUrl: `/posters/${filename}?v=${version}`,
    posterThumbUrl: `/posters/thumbs/${filename}?v=${version}`
  };
}

// URL for a single movie's poster, or null if it has none
function getPosterUrl(movieId) {
  const filename = getPosterMap().get(Number(movieId));
  return filename ? buildPosterUrls(filename).posterUrl : null;
}

// Delete any poster file(s) and thumbnail(s) for a movie. Safe to call when none exist.
// exceptExt: keep files with this extension (used after upload to purge stale formats only).
function deletePoster(movieId, exceptExt = null) {
  for (const ext of Object.values(MIME_EXTENSIONS)) {
    if (ext === exceptExt) continue;
    for (const dir of [POSTERS_DIR, THUMBS_DIR]) {
      const file = path.join(dir, `${movieId}.${ext}`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}

// Generate the thumbnail for a poster file if missing or older than the original.
// Returns the absolute thumb path, or null if the original doesn't exist.
async function ensureThumb(filename) {
  const original = path.join(POSTERS_DIR, filename);
  if (!fs.existsSync(original)) return null;

  const thumb = path.join(THUMBS_DIR, filename);
  const stale =
    !fs.existsSync(thumb) ||
    fs.statSync(thumb).mtimeMs < fs.statSync(original).mtimeMs;
  if (stale) {
    await sharp(original).resize({ width: THUMB_WIDTH, withoutEnlargement: true }).toFile(thumb);
  }
  return thumb;
}

// Attach virtual posterUrl/posterThumbUrl fields to a movie instance or an array of them
function withPosterUrl(movieOrMovies) {
  const posterMap = getPosterMap();
  const attach = (movie) => {
    const filename = posterMap.get(movie.id);
    const urls = filename
      ? buildPosterUrls(filename)
      : { posterUrl: null, posterThumbUrl: null };
    return { ...movie.toJSON(), ...urls };
  };
  return Array.isArray(movieOrMovies) ? movieOrMovies.map(attach) : attach(movieOrMovies);
}

module.exports = { POSTERS_DIR, MIME_EXTENSIONS, getPosterUrl, deletePoster, ensureThumb, withPosterUrl };
