const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');
const { DB_PATH, BACKUPS_DIR } = require('../config/paths');
const { sqlite3, open, all, exec, close, quote, tableColumns } = require('./sqlite');
const { LATEST_VERSION, schemaVersion, migrateFile } = require('./migrate');

// Tables a file must have to count as a FilmTrack backup. Views and notes are
// left out on purpose: backups made before those features existed lack them.
const REQUIRED_TABLES = [
  'Movies', 'Genres', 'Countries', 'Directors', 'Actors',
  'MovieGenres', 'MovieCountries', 'MovieDirectors', 'MovieActors'
];

const AUTO_BACKUPS_KEPT = 14;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

// Write a complete, consistent copy of the live database to `dest`.
// VACUUM INTO is safe while the app is running, unlike copying the file.
async function writeSnapshot(dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sequelize.query('VACUUM INTO ?', { replacements: [dest] });
  return dest;
}

// Local date as YYYY-MM-DD
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Once a day (checked at startup): backups/auto-YYYY-MM-DD.sqlite, keeping the newest 14
async function autoBackup() {
  const dest = path.join(BACKUPS_DIR, `auto-${today()}.sqlite`);
  if (fs.existsSync(dest)) return null;
  await writeSnapshot(dest);

  // Names sort by date, so the oldest come first
  const autos = fs.readdirSync(BACKUPS_DIR)
    .filter((f) => /^auto-\d{4}-\d{2}-\d{2}\.sqlite$/.test(f))
    .sort();
  for (const old of autos.slice(0, -AUTO_BACKUPS_KEPT)) {
    fs.unlinkSync(path.join(BACKUPS_DIR, old));
  }
  return dest;
}

// Reject anything that isn't an intact SQLite file with the FilmTrack tables.
// Throws an error with status 400 describing the problem.
async function validateBackup(file) {
  let db;
  try {
    db = await open(file, sqlite3.OPEN_READONLY);
    const [{ integrity_check: result }] = await all(db, 'PRAGMA integrity_check');
    if (result !== 'ok') throw badRequest('The backup file is damaged.');

    if (await schemaVersion(db) > LATEST_VERSION) {
      throw badRequest('This backup was made by a newer version of FilmTrack.');
    }

    const tables = new Set(
      (await all(db, "SELECT name FROM sqlite_master WHERE type = 'table'"))
        .map((t) => t.name.toLowerCase())
    );
    const missing = REQUIRED_TABLES.filter((t) => !tables.has(t.toLowerCase()));
    if (missing.length) {
      throw badRequest(`This isn't a FilmTrack backup (missing: ${missing.join(', ')}).`);
    }
  } catch (err) {
    if (err.status) throw err;
    // SQLITE_NOTADB and friends: not a database at all
    throw badRequest("This file isn't a FilmTrack backup.");
  } finally {
    if (db) await close(db);
  }
}

// Bring an uploaded backup up to the current schema, so old data is converted
// the same way the live database was. Only touches the uploaded copy.
async function upgradeBackup(file) {
  try {
    await migrateFile(file);
  } catch (err) {
    console.error('Backup upgrade failed:', err);
    throw badRequest("This backup couldn't be upgraded to the current version.");
  }
}

// Replace every row in the live database with the backup's, in one transaction,
// so the server keeps running and a failure leaves the current data untouched.
// Only columns both sides share are copied: a backup from before a column existed
// gets that column's default. Tables the backup lacks (e.g. notes in very old
// backups) are left as they are.
async function restoreFrom(file) {
  const db = await open(DB_PATH, sqlite3.OPEN_READWRITE);
  db.configure('busyTimeout', 5000);
  try {
    // Off for the copy: rows go in table by table, so links briefly point at
    // rows not copied yet. Must be set outside the transaction.
    await exec(db, 'PRAGMA foreign_keys = OFF');
    await all(db, 'ATTACH DATABASE ? AS src', [file]);

    const tableQuery = "SELECT name FROM %s.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'";
    const liveTables = (await all(db, tableQuery.replace('%s', 'main'))).map((t) => t.name);
    const srcTables = new Map(
      (await all(db, tableQuery.replace('%s', 'src'))).map((t) => [t.name.toLowerCase(), t.name])
    );

    await exec(db, 'BEGIN IMMEDIATE');
    try {
      for (const table of liveTables) {
        const srcTable = srcTables.get(table.toLowerCase());
        if (!srcTable) continue;

        const liveCols = await tableColumns(db, table);
        const srcCols = new Set(await tableColumns(db, srcTable, 'src'));
        const cols = liveCols.filter((c) => srcCols.has(c)).map(quote).join(', ');

        await exec(db, `DELETE FROM main.${quote(table)}`);
        await exec(db, `INSERT INTO main.${quote(table)} (${cols}) SELECT ${cols} FROM src.${quote(srcTable)}`);
      }
      await exec(db, 'COMMIT');
    } catch (err) {
      await exec(db, 'ROLLBACK');
      throw err;
    }
    await exec(db, 'DETACH DATABASE src');
  } finally {
    await close(db);
  }
}

module.exports = { writeSnapshot, autoBackup, validateBackup, upgradeBackup, restoreFrom };
