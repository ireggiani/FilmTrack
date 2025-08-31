const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');

const upload = multer({ dest: 'uploads/' });

// Backup route
router.get('/backup', (req, res) => {
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  res.download(dbPath, 'database.backup.sqlite', (err) => {
    if (err) {
      console.error('Error downloading database:', err);
      res.status(500).send('Error downloading database');
    }
  });
});

// Restore route
router.post('/restore', upload.single('db-file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const tempPath = req.file.path;
    const dbPath = path.join(__dirname, '..', 'database.sqlite');

    try {
        // Close the database connection
        await sequelize.close();

        // Replace the database file
        fs.renameSync(tempPath, dbPath);

        res.send('Database restored successfully. Please restart the server.');
    } catch (err) {
        console.error('Error restoring database:', err);
        // Attempt to remove the temporary file if it still exists
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        res.status(500).send('Error restoring database.');
    }
});

module.exports = router;
