const sqlite3 = require('sqlite3');

// Small promise wrappers over the raw sqlite3 driver, for work that needs its
// own connection (restoring, migrating) rather than Sequelize's
const open = (file, mode) => new Promise((resolve, reject) => {
  const db = new sqlite3.Database(file, mode, (err) => (err ? reject(err) : resolve(db)));
});
const all = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});
const exec = (db, sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => (err ? reject(err) : resolve()));
});
const close = (db) => new Promise((resolve) => db.close(() => resolve()));

const quote = (name) => `"${name.replace(/"/g, '""')}"`;

const tableColumns = async (db, table, schema = 'main') =>
  (await all(db, `PRAGMA ${schema}.table_info(${quote(table)})`)).map((c) => c.name);

module.exports = { sqlite3, open, all, exec, close, quote, tableColumns };
