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
