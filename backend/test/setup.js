// Point the app at a throwaway data folder. Must be required before anything
// that loads config/paths (models, app, utils). node --test runs each test
// file in its own process, so every file gets its own fresh database.
const fs = require('fs');
const os = require('os');
const path = require('path');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'filmtrack-test-'));
process.env.FILMTRACK_DATA_DIR = dataDir;

const { sequelize } = require('../models');
const { createApp } = require('../app');

async function setup() {
  await sequelize.sync();
  return createApp();
}

async function teardown() {
  await sequelize.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
}

module.exports = { dataDir, setup, teardown };
