const fs = require('fs');
const path = require('path');
const { sqlite3, open, all, exec, close } = require('./sqlite');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// migrations/NNN-name.js, each exporting up(db), where db is a raw sqlite3
// connection already inside a transaction. NNN is the schema version it leads to.
const MIGRATIONS = fs.readdirSync(MIGRATIONS_DIR)
  .filter((f) => /^\d{3}-.+\.js$/.test(f))
  .sort()
  .map((f) => ({
    version: parseInt(f, 10),
    name: f,
    up: require(path.join(MIGRATIONS_DIR, f)).up
  }));

const LATEST_VERSION = MIGRATIONS.at(-1).version;

const schemaVersion = async (db) => (await all(db, 'PRAGMA user_version'))[0].user_version;

// Bring a database file up to date, one transaction per migration. A failure
// rolls that migration back and rethrows, leaving the file at the last good
// version. Used on the live database at startup and on uploaded backups.
async function migrateFile(file, migrations = MIGRATIONS) {
  const db = await open(file, sqlite3.OPEN_READWRITE);
  db.configure('busyTimeout', 5000);
  try {
    const current = await schemaVersion(db);
    const pending = migrations.filter((m) => m.version > current);
    if (!pending.length) return [];

    // Must stay off: dropping a table to rebuild it would otherwise cascade
    // and delete every link row. node-sqlite3 turns foreign keys on by default,
    // and this pragma does nothing inside a transaction, so it's checked here.
    await exec(db, 'PRAGMA foreign_keys = OFF');
    if ((await all(db, 'PRAGMA foreign_keys'))[0].foreign_keys !== 0) {
      throw new Error('Could not turn foreign keys off for the migration');
    }

    // Old databases may already hold broken links; a migration just can't add more
    const brokenBefore = (await all(db, 'PRAGMA foreign_key_check')).length;

    for (const migration of pending) {
      await exec(db, 'BEGIN IMMEDIATE');
      try {
        await migration.up(db);
        const brokenAfter = (await all(db, 'PRAGMA foreign_key_check')).length;
        if (brokenAfter > brokenBefore) {
          throw new Error(`${migration.name} broke ${brokenAfter - brokenBefore} link(s)`);
        }
        await exec(db, `PRAGMA user_version = ${migration.version}`);
        await exec(db, 'COMMIT');
      } catch (err) {
        await exec(db, 'ROLLBACK');
        throw err;
      }
    }
    return pending.map((m) => m.name);
  } finally {
    await close(db);
  }
}

// A brand-new database is created by sync() in the current schema, so it starts
// at the latest version with nothing to run
async function markAsLatest(file) {
  const db = await open(file, sqlite3.OPEN_READWRITE);
  try {
    await exec(db, `PRAGMA user_version = ${LATEST_VERSION}`);
  } finally {
    await close(db);
  }
}

module.exports = { LATEST_VERSION, schemaVersion, migrateFile, markAsLatest };
