const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { dataDir, setup, teardown } = require('./setup');
const { autoBackup } = require('../utils/backup');

let app;
before(async () => { app = await setup(); });
after(teardown);

const backupsDir = path.join(dataDir, 'backups');
const titles = async () => (await request(app).get('/api/movies')).body.map((m) => m.title).sort();

// supertest buffers binary bodies only when asked to
const downloadBackup = async () => {
  const res = await request(app)
    .get('/api/database/backup')
    .buffer(true)
    .parse((r, cb) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
  assert.equal(res.status, 200);
  return res.body;
};

test('backup downloads a SQLite file with the current data', async () => {
  await request(app).post('/api/movies').send({ title: 'Stalker', releaseYear: 1979 }).expect(201);
  const file = await downloadBackup();
  assert.equal(file.subarray(0, 15).toString(), 'SQLite format 3');
});

test('restore rejects a file that is not a database, and keeps the data', async () => {
  const before = await titles();
  const res = await request(app)
    .post('/api/database/restore')
    .attach('db-file', Buffer.from('definitely not sqlite'), 'notes.txt');

  assert.equal(res.status, 400);
  assert.match(res.body.error, /isn't a FilmTrack backup/);
  assert.deepEqual(await titles(), before);
});

test('restore rejects a SQLite file without the FilmTrack tables', async () => {
  const sqlite3 = require('sqlite3');
  const other = path.join(dataDir, 'other.sqlite');
  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(other);
    db.exec('CREATE TABLE Things (id INTEGER)', (err) => db.close(() => (err ? reject(err) : resolve())));
  });

  const res = await request(app).post('/api/database/restore').attach('db-file', other);
  assert.equal(res.status, 400);
  assert.match(res.body.error, /missing: Movies/);
});

test('restore replaces the data without a restart and saves the old data first', async () => {
  const backup = await downloadBackup();
  await request(app).post('/api/movies').send({ title: 'Solaris', releaseYear: 1972 }).expect(201);
  assert.ok((await titles()).includes('Solaris'));

  const res = await request(app)
    .post('/api/database/restore')
    .attach('db-file', backup, 'database.backup.sqlite');
  assert.equal(res.status, 200, JSON.stringify(res.body));

  // Served straight away by the same running app
  const restored = await titles();
  assert.ok(restored.includes('Stalker'));
  assert.ok(!restored.includes('Solaris'));

  // The data from before the restore was kept
  assert.ok(fs.existsSync(path.join(backupsDir, res.body.previousData)));
});

test('daily backup is written once per day and keeps the newest 14', async () => {
  fs.mkdirSync(backupsDir, { recursive: true });
  for (let day = 1; day <= 20; day++) {
    fs.writeFileSync(path.join(backupsDir, `auto-2020-01-${String(day).padStart(2, '0')}.sqlite`), '');
  }

  const written = await autoBackup();
  assert.ok(written && fs.existsSync(written));
  assert.equal(await autoBackup(), null);

  const autos = fs.readdirSync(backupsDir).filter((f) => f.startsWith('auto-')).sort();
  assert.equal(autos.length, 14);
  assert.equal(autos.at(-1), path.basename(written));
  // Snapshots taken before a restore are never pruned
  assert.ok(fs.readdirSync(backupsDir).some((f) => f.startsWith('before-restore-')));
});

test('restore accepts an older backup that lacks newer columns', async () => {
  await request(app).post('/api/views').send({ name: 'Old view', filters: {} }).expect(201);
  const backup = path.join(dataDir, 'old.sqlite');
  fs.writeFileSync(backup, await downloadBackup());

  // Make it look like a backup from before views.isDefault existed
  const sqlite3 = require('sqlite3');
  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(backup);
    db.exec('ALTER TABLE views DROP COLUMN isDefault', (err) => db.close(() => (err ? reject(err) : resolve())));
  });

  const res = await request(app).post('/api/database/restore').attach('db-file', backup);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const views = (await request(app).get('/api/views')).body;
  assert.equal(views.find((v) => v.name === 'Old view').isDefault, false);
});
