const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { dataDir, setup, teardown } = require('./setup');
const { sqlite3, open, all, exec, close } = require('../utils/sqlite');
const { LATEST_VERSION, migrateFile } = require('../utils/migrate');

let app;
before(async () => { app = await setup(); });
after(teardown);

const OPEN = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
const STAMP = "'2020-01-01 00:00:00.000 +00:00'";

// A database as it was before migrations existed: text ratings, no isDefault
async function oldDatabase(name) {
  const file = path.join(dataDir, name);
  fs.rmSync(file, { force: true });
  const db = await open(file, OPEN);
  await exec(db, `
    CREATE TABLE Movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(255) NOT NULL, alternativeTitle VARCHAR(255),
      releaseYear INTEGER NOT NULL, rating VARCHAR(255), watchedDate DATE, createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL);
    CREATE TABLE views (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL UNIQUE, filters JSON NOT NULL, sorting JSON,
      createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL);
    INSERT INTO views (name, filters, createdAt, updatedAt) VALUES ('Old', '{}', ${STAMP}, ${STAMP});
    ${['Genres', 'Countries', 'Directors', 'Actors'].map((t) =>
      `CREATE TABLE ${t} (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, flagEmoji VARCHAR(255), createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL);`).join('\n')}
    ${[['MovieGenres', 'Genre', 'Genres'], ['MovieCountries', 'Country', 'Countries'], ['MovieDirectors', 'Director', 'Directors'], ['MovieActors', 'Actor', 'Actors']].map(([t, k, ref]) =>
      `CREATE TABLE ${t} (createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL,
        MovieId INTEGER NOT NULL REFERENCES Movies (id) ON DELETE CASCADE ON UPDATE CASCADE,
        ${k}Id INTEGER NOT NULL REFERENCES ${ref} (id) ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY (MovieId, ${k}Id));`).join('\n')}
    INSERT INTO Genres (id, name, createdAt, updatedAt) VALUES (1, 'Drama', ${STAMP}, ${STAMP});
  `);
  const ratings = ['7', '10', '7.5', '7,5', '8/10', '', '0', '11', ' 9 ', null];
  for (const [i, rating] of ratings.entries()) {
    await all(db, `INSERT INTO Movies (id, title, releaseYear, rating, createdAt, updatedAt) VALUES (?, ?, 2000, ?, ${STAMP}, ${STAMP})`,
      [i + 1, `Movie ${i + 1}`, rating]);
    await exec(db, `INSERT INTO MovieGenres (MovieId, GenreId, createdAt, updatedAt) VALUES (${i + 1}, 1, ${STAMP}, ${STAMP})`);
  }
  // As if a later movie had been deleted: the counter is past the last row
  await exec(db, "UPDATE sqlite_sequence SET seq = 50 WHERE name = 'Movies'");
  await close(db);
  return file;
}

const read = async (file, sql) => {
  const db = await open(file, sqlite3.OPEN_READONLY);
  try { return await all(db, sql); } finally { await close(db); }
};

test('migrations convert ratings and keep every movie and link', async () => {
  const file = await oldDatabase('old.sqlite');
  const applied = await migrateFile(file);
  assert.equal(applied.length, LATEST_VERSION);

  const movies = await read(file, 'SELECT rating, typeof(rating) t FROM Movies ORDER BY id');
  assert.deepEqual(movies.map((m) => m.rating), [7, 10, 7, 7, null, null, null, null, 9, null]);
  assert.ok(movies.every((m) => m.t === 'integer' || m.t === 'null'));

  assert.equal((await read(file, 'SELECT count(*) c FROM MovieGenres'))[0].c, 10);
  assert.deepEqual(await read(file, 'PRAGMA foreign_key_check'), []);
  assert.deepEqual(await read(file, 'SELECT isDefault FROM views'), [{ isDefault: 0 }]);
  assert.deepEqual(await read(file, "SELECT seq FROM sqlite_sequence WHERE name = 'Movies'"), [{ seq: 50 }]);
  assert.deepEqual(await read(file, 'PRAGMA user_version'), [{ user_version: LATEST_VERSION }]);

  // Links still point at the rebuilt table and still cascade
  const [link] = await read(file, "SELECT sql FROM sqlite_master WHERE name = 'MovieGenres'");
  assert.match(link.sql, /REFERENCES Movies/);
  assert.equal((await read(file, "SELECT count(*) c FROM sqlite_master WHERE name = 'Movies_new'"))[0].c, 0);
});

test('duplicate people merge and keep their movies', async () => {
  const file = await oldDatabase('duplicates.sqlite');
  const db = await open(file, sqlite3.OPEN_READWRITE);
  await exec(db, `
    INSERT INTO Actors (id, name, createdAt, updatedAt) VALUES
      (1, 'Mel Gibson', ${STAMP}, ${STAMP}), (2, ' mel gibson', ${STAMP}, ${STAMP}), (3, 'Jodie Foster', ${STAMP}, ${STAMP});
    INSERT INTO Directors (id, name, createdAt, updatedAt) VALUES (7, 'Mel Gibson', ${STAMP}, ${STAMP});
    INSERT INTO MovieActors (MovieId, ActorId, createdAt, updatedAt) VALUES
      (1, 1, ${STAMP}, ${STAMP}), (1, 2, ${STAMP}, ${STAMP}), (2, 2, ${STAMP}, ${STAMP}), (2, 3, ${STAMP}, ${STAMP});
    INSERT INTO MovieDirectors (MovieId, DirectorId, createdAt, updatedAt) VALUES (1, 7, ${STAMP}, ${STAMP});
  `);
  await close(db);

  await migrateFile(file);

  assert.deepEqual(await read(file, 'SELECT id, name FROM Actors ORDER BY id'),
    [{ id: 1, name: 'Mel Gibson' }, { id: 3, name: 'Jodie Foster' }]);
  assert.deepEqual(await read(file, 'SELECT MovieId, ActorId FROM MovieActors ORDER BY MovieId, ActorId'),
    [{ MovieId: 1, ActorId: 1 }, { MovieId: 2, ActorId: 1 }, { MovieId: 2, ActorId: 3 }]);
  assert.deepEqual(await read(file, 'SELECT id, name FROM Directors'), [{ id: 7, name: 'Mel Gibson' }]);
  assert.deepEqual(await read(file, 'SELECT DirectorId FROM MovieDirectors'), [{ DirectorId: 7 }]);
  assert.deepEqual(await read(file, 'PRAGMA foreign_key_check'), []);
});

test('the name indexes match what the models create', async () => {
  const file = await oldDatabase('indexes.sqlite');
  await migrateFile(file);
  const query = "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND name LIKE '%_name_unique' ORDER BY name";
  const normalize = (rows) => rows.map((r) => ({ name: r.name, sql: r.sql.replace(/[`"]/g, '') }));
  assert.deepEqual(normalize(await read(file, query)), normalize(await read(path.join(dataDir, 'database.sqlite'), query)));
});

test('the migrated table matches what the model creates', async () => {
  const file = await oldDatabase('shape.sqlite');
  await migrateFile(file);
  // Sorted because ALTER TABLE adds columns last, wherever the model lists them
  const shape = (rows) => rows
    .map(({ name, type, notnull, pk }) => ({ name, type, notnull, pk }))
    .sort((a, b) => a.name.localeCompare(b.name));
  assert.deepEqual(
    shape(await read(file, 'PRAGMA table_info(Movies)')),
    shape(await read(path.join(dataDir, 'database.sqlite'), 'PRAGMA table_info(Movies)'))
  );
});

test('running migrations twice changes nothing', async () => {
  const file = await oldDatabase('twice.sqlite');
  await migrateFile(file);
  assert.deepEqual(await migrateFile(file), []);
});

test('a failed migration rolls back and leaves the version alone', async () => {
  const file = await oldDatabase('fail.sqlite');
  const failing = [{
    version: 1,
    name: '001-fails.js',
    up: async (db) => {
      await exec(db, 'DELETE FROM Movies');
      throw new Error('boom');
    }
  }];
  await assert.rejects(migrateFile(file, failing), /boom/);
  assert.equal((await read(file, 'SELECT count(*) c FROM Movies'))[0].c, 10);
  assert.deepEqual(await read(file, 'PRAGMA user_version'), [{ user_version: 0 }]);
});

test('a migration that breaks links is refused', async () => {
  const file = await oldDatabase('links.sqlite');
  const breaking = [{
    version: 1,
    name: '001-breaks-links.js',
    up: (db) => exec(db, 'DELETE FROM Movies WHERE id = 1')
  }];
  await assert.rejects(migrateFile(file, breaking), /broke 1 link/);
  assert.equal((await read(file, 'SELECT count(*) c FROM Movies'))[0].c, 10);
});

test('a new database starts at the latest version', async () => {
  const live = path.join(dataDir, 'database.sqlite');
  assert.deepEqual(await read(live, 'PRAGMA user_version'), [{ user_version: LATEST_VERSION }]);
});

test('restoring an old backup converts its ratings', async () => {
  const file = await oldDatabase('restore.sqlite');
  const res = await request(app).post('/api/database/restore').attach('db-file', file);
  assert.equal(res.status, 200, JSON.stringify(res.body));

  const movies = (await request(app).get('/api/movies')).body.sort((a, b) => a.id - b.id);
  assert.equal(movies.length, 10);
  assert.deepEqual(movies.map((m) => m.rating), [7, 10, 7, 7, null, null, null, null, 9, null]);
  assert.equal(movies[0].Genres.length, 1);
});

test('a backup from a newer version is refused', async () => {
  const file = await oldDatabase('newer.sqlite');
  const db = await open(file, sqlite3.OPEN_READWRITE);
  await exec(db, `PRAGMA user_version = ${LATEST_VERSION + 1}`);
  await close(db);

  const res = await request(app).post('/api/database/restore').attach('db-file', file);
  assert.equal(res.status, 400);
  assert.match(res.body.error, /newer version/);
});

test('backups carry the schema version', async () => {
  const res = await request(app).get('/api/database/backup').buffer(true).parse((r, cb) => {
    const chunks = [];
    r.on('data', (c) => chunks.push(c));
    r.on('end', () => cb(null, Buffer.concat(chunks)));
  });
  const file = path.join(dataDir, 'download.sqlite');
  fs.writeFileSync(file, res.body);
  assert.deepEqual(await read(file, 'PRAGMA user_version'), [{ user_version: LATEST_VERSION }]);
});
