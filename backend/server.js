const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/movies', require('./routes/movies'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/directors', require('./routes/directors'));
app.use('/api/actors', require('./routes/actors'));
app.use('/api/database', require('./routes/database'));
app.use('/api/views', require('./routes/views'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
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