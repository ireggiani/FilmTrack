const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown } = require('./setup');

let app;
before(async () => { app = await setup(); });
after(teardown);

test('creates and updates a movie with its links', async () => {
  const genre = (await request(app).post('/api/genres').send({ name: 'Drama' })).body;
  const director = (await request(app).post('/api/directors').send({ name: 'Agnès Varda' })).body;

  const created = await request(app).post('/api/movies').send({
    title: 'Cléo from 5 to 7', releaseYear: 1962, rating: '9',
    genreIds: [genre.id], directorIds: [director.id]
  });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body.Genres.map((g) => g.name), ['Drama']);
  assert.deepEqual(created.body.Directors.map((d) => d.name), ['Agnès Varda']);

  const updated = await request(app).put(`/api/movies/${created.body.id}`).send({
    title: 'Cléo de 5 à 7', releaseYear: 1962, genreIds: []
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, 'Cléo de 5 à 7');
  assert.deepEqual(updated.body.Genres, []);
  // Links not sent in the update are left alone
  assert.equal(updated.body.Directors.length, 1);
});

test('rejects a movie without a title', async () => {
  const res = await request(app).post('/api/movies').send({ title: '  ', releaseYear: 2000 });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /required/);
});

test('returns 404 as JSON for a missing movie', async () => {
  const res = await request(app).get('/api/movies/999999');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Movie not found');
});

test('deleting a genre removes its links to movies', async () => {
  const genre = (await request(app).post('/api/genres').send({ name: 'Western' })).body;
  const movie = (await request(app).post('/api/movies').send({
    title: 'Rio Bravo', releaseYear: 1959, genreIds: [genre.id]
  })).body;

  await request(app).delete(`/api/genres/${genre.id}`).expect(204);
  const res = await request(app).get(`/api/movies/${movie.id}`);
  assert.deepEqual(res.body.Genres, []);
});

test('a duplicate genre name is a 409', async () => {
  await request(app).post('/api/genres').send({ name: 'Noir' }).expect(201);
  const res = await request(app).post('/api/genres').send({ name: 'Noir' });
  assert.equal(res.status, 409);
  assert.ok(res.body.error);
});

test('uploaded posters are stored in the data folder', async () => {
  const fs = require('fs');
  const path = require('path');
  const sharp = require('sharp');
  const { dataDir } = require('./setup');

  const movie = (await request(app).post('/api/movies').send({ title: 'Ran', releaseYear: 1985 })).body;
  const png = await sharp({ create: { width: 4, height: 6, channels: 3, background: '#a00' } }).png().toBuffer();

  const res = await request(app).post(`/api/movies/${movie.id}/poster`).attach('poster', png, 'ran.png');
  assert.equal(res.status, 200);
  assert.match(res.body.posterUrl, new RegExp(`^/posters/${movie.id}\\.png\\?v=`));
  assert.ok(fs.existsSync(path.join(dataDir, 'posters', `${movie.id}.png`)));

  await request(app).get(`/posters/thumbs/${movie.id}.png`).expect(200);
});

test('the movie row keeps track of its poster', async () => {
  const sharp = require('sharp');
  const { Movie } = require('../models');

  const movie = (await request(app).post('/api/movies').send({ title: 'Ikiru', releaseYear: 1952 })).body;
  assert.equal(movie.posterUrl, null);
  assert.ok(!('posterExt' in movie) && !('posterVersion' in movie));
  const image = sharp({ create: { width: 4, height: 6, channels: 3, background: '#0a0' } });

  await request(app).post(`/api/movies/${movie.id}/poster`).attach('poster', await image.clone().png().toBuffer(), 'a.png').expect(200);
  const row = await Movie.findByPk(movie.id);
  assert.equal(row.posterExt, 'png');
  assert.ok(row.posterVersion > 0);
  // A poster isn't an edit to the movie
  assert.equal(row.updatedAt.toISOString(), movie.updatedAt);

  const listed = (await request(app).get('/api/movies')).body.find((m) => m.id === movie.id);
  assert.equal(listed.posterUrl, `/posters/${movie.id}.png?v=${row.posterVersion}`);
  assert.equal(listed.posterThumbUrl, `/posters/thumbs/${movie.id}.png?v=${row.posterVersion}`);

  // Replacing it with another format moves the row along with the file
  const replaced = await request(app).post(`/api/movies/${movie.id}/poster`).attach('poster', await image.clone().webp().toBuffer(), 'a.webp').expect(200);
  assert.match(replaced.body.posterUrl, new RegExp(`^/posters/${movie.id}\\.webp\\?v=`));

  await request(app).delete(`/api/movies/${movie.id}/poster`).expect(204);
  const cleared = (await request(app).get(`/api/movies/${movie.id}`)).body;
  assert.equal(cleared.posterUrl, null);
  assert.equal(cleared.posterThumbUrl, null);
});

test('reconciling makes the rows match the posters folder', async () => {
  const fs = require('fs');
  const path = require('path');
  const { dataDir } = require('./setup');
  const { Movie } = require('../models');
  const { reconcilePosters } = require('../utils/posters');

  const a = (await request(app).post('/api/movies').send({ title: 'Added by hand', releaseYear: 2001 })).body;
  const b = (await request(app).post('/api/movies').send({ title: 'File gone', releaseYear: 2002 })).body;
  const file = path.join(dataDir, 'posters', `${a.id}.jpg`);
  fs.writeFileSync(file, 'image');
  await Movie.update({ posterExt: 'jpg', posterVersion: 123 }, { where: { id: b.id }, silent: true });

  await reconcilePosters();

  const version = Math.round(fs.statSync(file).mtimeMs);
  assert.equal((await request(app).get(`/api/movies/${a.id}`)).body.posterUrl, `/posters/${a.id}.jpg?v=${version}`);
  assert.equal((await request(app).get(`/api/movies/${b.id}`)).body.posterUrl, null);
  // A reconcile that finds nothing to fix isn't an edit either
  assert.equal((await Movie.findByPk(a.id)).updatedAt.toISOString(), a.updatedAt);
});
