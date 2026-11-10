const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown } = require('./setup');

let app;
before(async () => { app = await setup(); });
after(teardown);

const rejects = async (method, url, body, pattern) => {
  const res = await request(app)[method](url).send(body);
  assert.equal(res.status, 400, JSON.stringify(res.body));
  assert.match(res.body.error, pattern);
};

test('movie fields are checked with readable messages', async () => {
  await rejects('post', '/api/movies', { title: '', releaseYear: '' }, /Title is required\. Release year is required/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 'soon' }, /Release year must be a number/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, rating: 'great' }, /Rating must be a number/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, rating: 11 }, /whole number from 1 to 10/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, rating: 7.5 }, /whole number from 1 to 10/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, rating: 0 }, /whole number from 1 to 10/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, watchedDate: '31/02/2024' }, /Watched date/);
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, genreIds: ['drama'] }, /Genres must be a list of ids/);
});

test('movie input is cleaned before saving', async () => {
  const res = await request(app).post('/api/movies').send({
    title: '  Ran  ', releaseYear: '1985', rating: '8', watchedDate: '', alternativeTitle: '',
    // Extra fields, as the movie editor sends them, are ignored
    id: 999, createdAt: 'yesterday', Genres: [{ id: 1 }]
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.equal(res.body.title, 'Ran');
  assert.equal(res.body.releaseYear, 1985);
  assert.equal(res.body.rating, 8);
  assert.equal(res.body.watchedDate, null);
  assert.equal(res.body.alternativeTitle, null);
  assert.notEqual(res.body.id, 999);
});

test('linking a movie to a missing genre is a 400, not a 500', async () => {
  await rejects('post', '/api/movies', { title: 'Ran', releaseYear: 1985, genreIds: [424242] }, /no longer exists/);
});

test('lookup names are required and trimmed', async () => {
  await rejects('post', '/api/genres', { name: '   ' }, /Genre name is required/);
  await rejects('post', '/api/directors', {}, /Director name is required/);
  await rejects('post', '/api/countries', { name: 'Japan' }, /Flag is required/);

  const res = await request(app).post('/api/actors').send({ name: '  Toshiro Mifune ', id: 7 });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Toshiro Mifune');
});

test('people are unique per table, ignoring case', async () => {
  const actor = await request(app).post('/api/actors').send({ name: 'Mel Gibson' }).expect(201);
  const other = await request(app).post('/api/actors').send({ name: 'Jodie Foster' }).expect(201);

  const duplicate = await request(app).post('/api/actors').send({ name: 'mel gibson' }).expect(409);
  assert.match(duplicate.body.error, /already in use/);
  await request(app).put(`/api/actors/${other.body.id}`).send({ name: 'MEL GIBSON' }).expect(409);

  // Their own name in a new capitalization, and the same person as a director
  await request(app).put(`/api/actors/${actor.body.id}`).send({ name: 'MEL GIBSON' }).expect(200);
  await request(app).post('/api/directors').send({ name: 'Mel Gibson' }).expect(201);
  await request(app).post('/api/directors').send({ name: 'mel gibson' }).expect(409);
});

test('a lookup update can send just the changed field', async () => {
  const country = (await request(app).post('/api/countries').send({ name: 'Japan', flagEmoji: '🇯🇵' })).body;
  const res = await request(app).put(`/api/countries/${country.id}`).send({ name: 'Nippon' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Nippon');
  assert.equal(res.body.flagEmoji, '🇯🇵');
});

test('views and notes are checked', async () => {
  await rejects('post', '/api/views', { name: 'All', filters: 'none' }, /View filters must be an object/);
  await rejects('post', '/api/views', { name: 'All', filters: {}, sorting: { key: 'title', direction: 'up' } }, /sorting/);
  await rejects('put', '/api/views/1', { isDefault: 'yes' }, /isDefault must be true or false/);
  await rejects('post', '/api/notes', { title: 'x', content: 42 }, /Note content must be text/);
});

test('a note over the size limit gets a readable message', async () => {
  const res = await request(app).post('/api/notes').send({ title: 'Long', content: 'x'.repeat(101 * 1024) });
  assert.equal(res.status, 413);
  assert.match(res.body.error, /too large to save/);
});
