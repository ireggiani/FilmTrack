const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown } = require('./setup');

let app;
before(async () => { app = await setup(); });
after(teardown);

test('a duplicate view name is a 409 with a readable message', async () => {
  const view = { name: 'Favourites', filters: {} };
  await request(app).post('/api/views').send(view).expect(201);

  const res = await request(app).post('/api/views').send(view);
  assert.equal(res.status, 409);
  assert.equal(res.body.error, 'A view with that name already exists');
});

test('starring a view unstars the others', async () => {
  const a = (await request(app).post('/api/views').send({ name: 'A', filters: {}, isDefault: true })).body;
  const b = (await request(app).post('/api/views').send({ name: 'B', filters: {} })).body;

  await request(app).put(`/api/views/${b.id}`).send({ isDefault: true }).expect(200);
  const views = (await request(app).get('/api/views')).body;
  assert.equal(views.find((v) => v.id === a.id).isDefault, false);
  assert.equal(views.find((v) => v.id === b.id).isDefault, true);
});
