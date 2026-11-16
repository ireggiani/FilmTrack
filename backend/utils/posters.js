const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { POSTERS_DIR } = require('../config/paths');
const { Movie, Series, sequelize } = require('../models');

// 2x the 200px hover-preview display size, crisp on hidpi screens
const THUMB_WIDTH = 400;

// Extensions we store, derived from validated mimetypes — never from client filenames
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const NO_POSTER = { posterExt: null, posterVersion: null };

// Poster files for one kind of record, named <id>.<ext> in a folder of their
// own (with thumbs/ inside) so a movie and a series with the same id never
// share a file. Movies keep the top of the posters folder, as they always
// have; `subdir` puts another kind below it, and its URLs follow.
function createPosterStore(Model, subdir = '') {
  const dir = path.join(POSTERS_DIR, subdir);
  const thumbsDir = path.join(dir, 'thumbs');
  const urlBase = subdir ? `/posters/${subdir}` : '/posters';

  // Ensure the poster directories exist on load
  fs.mkdirSync(thumbsDir, { recursive: true });

  // Read the folder and return Map<record id (number), filename>
  function getPosterMap() {
    const map = new Map();
    for (const file of fs.readdirSync(dir)) {
      const match = file.match(/^(\d+)\.(jpg|png|webp)$/);
      if (match) map.set(parseInt(match[1], 10), file);
    }
    return map;
  }

  // What the row stores about a poster file. The version is the file's
  // mtime, so replacing a poster busts the thumb URL too.
  function posterFields(filename) {
    const { mtimeMs } = fs.statSync(path.join(dir, filename));
    return { posterExt: path.extname(filename).slice(1), posterVersion: Math.round(mtimeMs) };
  }

  // silent: a new poster doesn't count as editing the record, so updatedAt stays
  async function recordPoster(record, ext) {
    await record.update(posterFields(`${record.id}.${ext}`), { silent: true });
  }

  async function clearPoster(record) {
    await record.update(NO_POSTER, { silent: true });
  }

  // Make every row match the folder. Backups hold no images, so a restored row
  // can claim a file that's gone or miss one that's there, and a failed save
  // can leave the two apart. The folder wins: runs at startup and after a
  // restore, and writes only the rows that differ.
  async function reconcile() {
    const files = getPosterMap();
    const records = await Model.findAll({ attributes: ['id', 'posterExt', 'posterVersion'] });
    await sequelize.transaction(async (transaction) => {
      for (const record of records) {
        const filename = files.get(record.id);
        const fields = filename ? posterFields(filename) : NO_POSTER;
        if (fields.posterExt === record.posterExt && fields.posterVersion === record.posterVersion) continue;
        await record.update(fields, { silent: true, transaction });
      }
    });
  }

  // Delete any poster file(s) and thumbnail(s) for a record. Safe to call when none exist.
  // exceptExt: keep files with this extension (used after upload to purge stale formats only).
  function deletePoster(id, exceptExt = null) {
    for (const ext of Object.values(MIME_EXTENSIONS)) {
      if (ext === exceptExt) continue;
      for (const folder of [dir, thumbsDir]) {
        const file = path.join(folder, `${id}.${ext}`);
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
    }
  }

  // Generate the thumbnail for a poster file if missing or older than the original.
  // Returns the absolute thumb path, or null if the original doesn't exist.
  async function ensureThumb(filename) {
    const original = path.join(dir, filename);
    if (!fs.existsSync(original)) return null;

    const thumb = path.join(thumbsDir, filename);
    const stale =
      !fs.existsSync(thumb) ||
      fs.statSync(thumb).mtimeMs < fs.statSync(original).mtimeMs;
    if (stale) {
      await sharp(original).resize({ width: THUMB_WIDTH, withoutEnlargement: true }).toFile(thumb);
    }
    return thumb;
  }

  // Replace the stored poster fields with posterUrl/posterThumbUrl on a record
  // or an array of them
  function withPosterUrl(recordOrRecords) {
    const attach = (record) => {
      const { posterExt, posterVersion, ...fields } = record.toJSON();
      if (!posterExt) return { ...fields, posterUrl: null, posterThumbUrl: null };
      const filename = `${record.id}.${posterExt}`;
      return {
        ...fields,
        posterUrl: `${urlBase}/${filename}?v=${posterVersion}`,
        posterThumbUrl: `${urlBase}/thumbs/${filename}?v=${posterVersion}`
      };
    };
    return Array.isArray(recordOrRecords) ? recordOrRecords.map(attach) : attach(recordOrRecords);
  }

  return { dir, recordPoster, clearPoster, reconcile, deletePoster, ensureThumb, withPosterUrl };
}

const moviePosters = createPosterStore(Movie);
const seriesPosters = createPosterStore(Series, 'series');

// Every kind at once, for startup and after a restore
async function reconcilePosters() {
  await moviePosters.reconcile();
  await seriesPosters.reconcile();
}

module.exports = { POSTERS_DIR, MIME_EXTENSIONS, moviePosters, seriesPosters, reconcilePosters };
