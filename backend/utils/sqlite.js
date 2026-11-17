// @ts-check
const sqlite3 = require('sqlite3');

/** @typedef {import('sqlite3').Database} Database */

// Small promise wrappers over the raw sqlite3 driver, for work that needs its
// own connection (restoring, migrating) rather than Sequelize's

/**
 * @param {string} file
 * @param {number} mode One or more sqlite3.OPEN_* flags
 * @returns {Promise<Database>}
 */
const open = (file, mode) => new Promise((resolve, reject) => {
  const db = new sqlite3.Database(file, mode, (err) => (err ? reject(err) : resolve(db)));
});
/**
 * @param {Database} db
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<any[]>} The rows, as objects keyed by column
 */
const all = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});
/**
 * @param {Database} db
 * @param {string} sql
 * @returns {Promise<void>}
 */
const exec = (db, sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => (err ? reject(err) : resolve()));
});
/**
 * @param {Database} db
 * @returns {Promise<void>}
 */
const close = (db) => new Promise((resolve) => db.close(() => resolve()));

/** @param {string} name */
const quote = (name) => `"${name.replace(/"/g, '""')}"`;

/**
 * @param {Database} db
 * @param {string} table
 * @param {string} [schema] 'main', or the name a database was attached under
 * @returns {Promise<string[]>} Empty when the table doesn't exist
 */
const tableColumns = async (db, table, schema = 'main') =>
  (await all(db, `PRAGMA ${schema}.table_info(${quote(table)})`)).map((c) => c.name);

module.exports = { sqlite3, open, all, exec, close, quote, tableColumns };
