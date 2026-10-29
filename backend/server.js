const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { DATA_DIR, DB_PATH } = require('./config/paths');

// Data used to live inside backend/. If it's still there and the data folder has
// no database, stop rather than start on a new, empty one.
const LEGACY_DB = path.join(__dirname, 'database.sqlite');
if (!fs.existsSync(DB_PATH) && fs.existsSync(LEGACY_DB)) {
  console.error(`No database at ${DB_PATH}, but ${LEGACY_DB} exists.`);
  console.error('Move it (and uploads/posters) into the data folder; see docs/backend.md.');
  process.exit(1);
}
fs.mkdirSync(DATA_DIR, { recursive: true });

const { sequelize } = require('./models');
const { createApp } = require('./app');
const { autoBackup } = require('./utils/backup');

const PORT = process.env.PORT || 5000;

// sync() only creates missing tables, so columns added to a model after its
// table exists (or missing from a restored older backup) are added here
const addMissingColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const viewColumns = await queryInterface.describeTable('views');
  if (!viewColumns.isDefault) {
    await queryInterface.addColumn('views', 'isDefault', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};

// A failed backup shouldn't keep the app from starting
const runAutoBackup = async () => {
  try {
    const file = await autoBackup();
    if (file) console.log(`Daily backup written to ${file}`);
  } catch (err) {
    console.error('Daily backup failed:', err);
  }
};

// Initialize database
sequelize.sync({ force: false })
  .then(addMissingColumns)
  .then(runAutoBackup)
  .then(() => {
    console.log('Database synced');
    createApp().listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
  });
