const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const sharp = require('sharp');
const { dataDir, setup, teardown } = require('./setup');

let app;
before(async () => { app = await setup(); });
after(teardown);

const png = (background) =>
  sharp({ create: { width: 4, height: 6, channels: 3, background } }).png().toBuffer();

test('creates and updates a series, sharing genres and people with movies', async () => {
  const genre = (await request(app).post('/api/genres').send({ name: 'Mystery' })).body;
  const director = (await request(app).post('/api/directors').send({ name: 'David Lynch' })).body;
  const movie = (await request(app).post('/api/movies').send({
    title: 'Blue Velvet', releaseYear: 1986, genreIds: [genre.id], directorIds: [director.id]
  })).body;

  const created = await request(app).post('/api/series').send({
    title: 'Twin Peaks', releaseYear: '1990', rating: 9, watchedDate: '',
    genreIds: [genre.id], directorIds: [director.id]
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.releaseYear, 1990);
  assert.equal(created.body.watchedDate, null);
  assert.deepEqual(created.body.Genres.map((g) => g.name), ['Mystery']);
  assert.deepEqual(created.body.Directors.map((d) => d.name), ['David Lynch']);

  const updated = await request(app).put(`/api/series/${created.body.id}`).send({
    title: 'Twin Peaks', alternativeTitle: 'TP', releaseYear: 1990, genreIds: []
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.alternativeTitle, 'TP');
  assert.deepEqual(updated.body.Genres, []);
  assert.equal(updated.body.Directors.length, 1);

  // The two lists are separate, and the movie's own links are untouched
  assert.ok(!(await request(app).get('/api/movies')).body.some((m) => m.title === 'Twin Peaks'));
  assert.deepEqual((await request(app).get(`/api/movies/${movie.id}`)).body.Genres.map((g) => g.name), ['Mystery']);
});

test('series are validated like movies', async () => {
  const res = await request(app).post('/api/series').send({ title: ' ', releaseYear: 2000, rating: 11 });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Title is required/);
  assert.match(res.body.error, /Rating/);

  const missing = await request(app).get('/api/series/999999');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'Series not found');
});

test('deleting a genre removes its links to series', async () => {
  const genre = (await request(app).post('/api/genres').send({ name: 'Fantasy' })).body;
  const series = (await request(app).post('/api/series').send({
    title: "Gulliver's Travels", releaseYear: 1996, genreIds: [genre.id]
  })).body;

  await request(app).delete(`/api/genres/${genre.id}`).expect(204);
  assert.deepEqual((await request(app).get(`/api/series/${series.id}`)).body.Genres, []);
});

test('a series poster never shares a file with the movie of the same id', async () => {
  const { Movie, Series } = require('../models');
  const movie = (await request(app).post('/api/movies').send({ title: 'Same id', releaseYear: 2001 })).body;
  // Force the ids to match, whatever was created before
  const series = await Series.create({ id: movie.id + 1000, title: 'Same id', releaseYear: 2001 });
  const twin = await Movie.create({ id: series.id, title: 'Twin', releaseYear: 2001 });

  await request(app).post(`/api/movies/${twin.id}/poster`).attach('poster', await png('#a00'), 'm.png').expect(200);
  const res = await request(app).post(`/api/series/${series.id}/poster`).attach('poster', await png('#00a'), 's.png');
  assert.equal(res.status, 200);
  assert.match(res.body.posterUrl, new RegExp(`^/posters/series/${series.id}\\.png\\?v=`));
  assert.match(res.body.posterThumbUrl, new RegExp(`^/posters/series/thumbs/${series.id}\\.png\\?v=`));

  const moviePoster = path.join(dataDir, 'posters', `${twin.id}.png`);
  const seriesPoster = path.join(dataDir, 'posters', 'series', `${series.id}.png`);
  assert.ok(fs.existsSync(moviePoster) && fs.existsSync(seriesPoster));
  assert.notDeepEqual(fs.readFileSync(moviePoster), fs.readFileSync(seriesPoster));

  await request(app).get(`/posters/series/${series.id}.png`).expect(200);
  await request(app).get(`/posters/series/thumbs/${series.id}.png`).expect(200);

  // Deleting the series takes its poster and leaves the movie's
  await request(app).delete(`/api/series/${series.id}`).expect(204);
  assert.ok(!fs.existsSync(seriesPoster));
  assert.ok(fs.existsSync(moviePoster));
  assert.match((await request(app).get(`/api/movies/${twin.id}`)).body.posterUrl, /^\/posters\/\d+\.png/);
});

test('reconciling picks up series posters from their own folder', async () => {
  const { reconcilePosters } = require('../utils/posters');
  const series = (await request(app).post('/api/series').send({ title: 'By hand', releaseYear: 2003 })).body;
  const file = path.join(dataDir, 'posters', 'series', `${series.id}.jpg`);
  fs.writeFileSync(file, 'image');

  await reconcilePosters();

  const version = Math.round(fs.statSync(file).mtimeMs);
  assert.equal((await request(app).get(`/api/series/${series.id}`)).body.posterUrl, `/posters/series/${series.id}.jpg?v=${version}`);
});

test('restoring a backup from before series existed leaves no series behind', async () => {
  const sqlite3 = require('sqlite3');
  const res = await request(app).get('/api/database/backup').buffer(true).parse((r, cb) => {
    const chunks = [];
    r.on('data', (c) => chunks.push(c));
    r.on('end', () => cb(null, Buffer.concat(chunks)));
  });
  const backup = path.join(dataDir, 'before-series.sqlite');
  fs.writeFileSync(backup, res.body);
  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(backup);
    db.exec(`DROP TABLE SeriesGenres; DROP TABLE SeriesCountries; DROP TABLE SeriesDirectors; DROP TABLE SeriesActors;
      DROP TABLE Series; PRAGMA user_version = 4`, (err) => db.close(() => (err ? reject(err) : resolve())));
  });
  assert.ok((await request(app).get('/api/series')).body.length > 0);

  const restored = await request(app).post('/api/database/restore').attach('db-file', backup);
  assert.equal(restored.status, 200, JSON.stringify(restored.body));
  assert.deepEqual((await request(app).get('/api/series')).body, []);

  // And the tables still work afterwards
  await request(app).post('/api/series').send({ title: 'After restore', releaseYear: 2020 }).expect(201);
});
