const path = require('path');
// Loaded here too so FILMTRACK_DATA_DIR can be set in backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Where all user data lives: the database, backups and posters. Defaults to
// data/ at the repo root, outside the code; FILMTRACK_DATA_DIR points it
// elsewhere, e.g. a scratch folder for tests.
const DATA_DIR = process.env.FILMTRACK_DATA_DIR
  ? path.resolve(process.env.FILMTRACK_DATA_DIR)
  : path.join(__dirname, '..', '..', 'data');

module.exports = {
  DATA_DIR,
  DB_PATH: path.join(DATA_DIR, 'database.sqlite'),
  BACKUPS_DIR: path.join(DATA_DIR, 'backups'),
  POSTERS_DIR: path.join(DATA_DIR, 'posters')
};
