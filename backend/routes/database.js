const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { BACKUPS_DIR } = require('../config/paths');
const { writeSnapshot, validateBackup, restoreFrom } = require('../utils/backup');

const MAX_BACKUP_MB = 100;
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: MAX_BACKUP_MB * 1024 * 1024 }
});

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// Backup route: a consistent snapshot, not the live file
router.get('/backup', async (req, res) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'filmtrack-backup-'));
  const cleanup = () => fs.rmSync(tmpDir, { recursive: true, force: true });
  try {
    const snapshot = await writeSnapshot(path.join(tmpDir, 'database.sqlite'));
    res.download(snapshot, 'database.backup.sqlite', (err) => {
      cleanup();
      if (err) console.error('Error downloading database:', err);
    });
  } catch (err) {
    cleanup();
    throw err;
  }
});

// Restore route: check the upload, keep a copy of the current data, then swap the rows in
router.post('/restore', upload.single('db-file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    await validateBackup(req.file.path);
    const snapshot = await writeSnapshot(path.join(BACKUPS_DIR, `before-restore-${timestamp()}.sqlite`));
    await restoreFrom(req.file.path);
    res.json({
      message: 'Database restored successfully.',
      previousData: path.basename(snapshot)
    });
  } finally {
    fs.rmSync(req.file.path, { force: true });
  }
});

module.exports = router;
