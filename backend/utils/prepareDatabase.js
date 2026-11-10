const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');
const { DB_PATH, BACKUPS_DIR } = require('../config/paths');
const { sqlite3, open, all, close } = require('./sqlite');
const { LATEST_VERSION, schemaVersion, migrateFile, markAsLatest } = require('./migrate');
const { writeSnapshot } = require('./backup');
const { reconcilePosters } = require('./posters');

// Read the existing database's version, or null if there's no database yet
async function existingVersion() {
  if (!fs.existsSync(DB_PATH)) return null;
  const db = await open(DB_PATH, sqlite3.OPEN_READONLY);
  try {
    const [movies] = await all(db, "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'Movies'");
    return movies ? await schemaVersion(db) : null;
  } finally {
    await close(db);
  }
}

// Get the database ready at startup. Migrations run before sync() because sync
// only creates missing tables and would leave existing ones as they are.
async function prepareDatabase() {
  const version = await existingVersion();

  if (version === null) {
    await sequelize.sync();
    await markAsLatest(DB_PATH);
    return;
  }

  if (version < LATEST_VERSION) {
    const snapshot = path.join(BACKUPS_DIR, `before-migration-${LATEST_VERSION}.sqlite`);
    // Kept from the first attempt if an earlier run of this migration failed
    if (!fs.existsSync(snapshot)) await writeSnapshot(snapshot);
    const applied = await migrateFile(DB_PATH);
    console.log(`Database migrated: ${applied.join(', ')}`);
  }
  await sequelize.sync();
  await reconcilePosters();
}

module.exports = { prepareDatabase };
