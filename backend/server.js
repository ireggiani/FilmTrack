const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression());
app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes - must come before static files
app.use('/api/movies', require('./routes/movies'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/directors', require('./routes/directors'));
app.use('/api/actors', require('./routes/actors'));
app.use('/api/database', require('./routes/database'));
app.use('/api/views', require('./routes/views'));
app.use('/api/notes', require('./routes/notes'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Serve static files from public directory with fallback to index.html for SPA
app.use(express.static(path.join(__dirname, 'public'), {
  index: false
}));

// SPA fallback: serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
  });