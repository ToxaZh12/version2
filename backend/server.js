// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { applyMigrations } = require('./util/db');

const booksRouter = require('./routes/books');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// API
app.use('/api/books', booksRouter);
app.use('/api/tasks', tasksRouter);

// Serve frontend static files
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

if (process.argv.includes('migrate')) {
  applyMigrations();
  console.log('Migrations applied.');
  process.exit(0);
}

// ensure migrations on start
applyMigrations();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}/books.html and /tasks.html`);
});
