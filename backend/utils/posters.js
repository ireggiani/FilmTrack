const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { POSTERS_DIR } = require('../config/paths');
const { Movie, sequelize } = require('../models');

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

// What the Movies row stores about a poster file. The version is the file's
// mtime, so replacing a poster busts the thumb URL too.
function posterFields(filename) {
  const { mtimeMs } = fs.statSync(path.join(POSTERS_DIR, filename));
  return { posterExt: path.extname(filename).slice(1), posterVersion: Math.round(mtimeMs) };
}

const NO_POSTER = { posterExt: null, posterVersion: null };

// silent: a new poster doesn't count as editing the movie, so updatedAt stays
async function recordPoster(movie, ext) {
  await movie.update(posterFields(`${movie.id}.${ext}`), { silent: true });
}

async function clearPoster(movie) {
  await movie.update(NO_POSTER, { silent: true });
}

// Make every Movies row match the posters folder. Backups hold no images, so a
// restored row can claim a file that's gone or miss one that's there, and a
// failed save can leave the two apart. The folder wins: runs at startup and
// after a restore, and writes only the rows that differ.
async function reconcilePosters() {
  const files = getPosterMap();
  const movies = await Movie.findAll({ attributes: ['id', 'posterExt', 'posterVersion'] });
  await sequelize.transaction(async (transaction) => {
    for (const movie of movies) {
      const filename = files.get(movie.id);
      const fields = filename ? posterFields(filename) : NO_POSTER;
      if (fields.posterExt === movie.posterExt && fields.posterVersion === movie.posterVersion) continue;
      await movie.update(fields, { silent: true, transaction });
    }
  });
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

// Replace the stored poster fields with posterUrl/posterThumbUrl on a movie
// instance or an array of them
function withPosterUrl(movieOrMovies) {
  const attach = (movie) => {
    const { posterExt, posterVersion, ...fields } = movie.toJSON();
    if (!posterExt) return { ...fields, posterUrl: null, posterThumbUrl: null };
    const filename = `${movie.id}.${posterExt}`;
    return {
      ...fields,
      posterUrl: `/posters/${filename}?v=${posterVersion}`,
      posterThumbUrl: `/posters/thumbs/${filename}?v=${posterVersion}`
    };
  };
  return Array.isArray(movieOrMovies) ? movieOrMovies.map(attach) : attach(movieOrMovies);
}

module.exports = { POSTERS_DIR, MIME_EXTENSIONS, recordPoster, clearPoster, reconcilePosters, deletePoster, ensureThumb, withPosterUrl };
