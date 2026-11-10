const { all, exec, quote, tableColumns } = require('../utils/sqlite');

// Movies.rating becomes a whole number from 1 to 10. SQLite can't change a
// column's type, so the table is rebuilt: new table, copy, drop, rename. The
// copy names its columns because very old backups may lack some of them.
//
// Old values: decimals are cut down to the whole number below ("7.5" becomes 7)
// and anything outside 1–10 or not numeric ("8/10") becomes no rating.
const NUMBER_TEXT = "replace(trim(rating), ',', '.')";
const RATING = `CASE
  WHEN ${NUMBER_TEXT} NOT GLOB '*[^0-9.]*' AND CAST(${NUMBER_TEXT} AS REAL) >= 1 AND CAST(${NUMBER_TEXT} AS REAL) <= 10
  THEN CAST(${NUMBER_TEXT} AS INTEGER)
END`;

exports.up = async (db) => {
  // The rebuilt table starts its id counter from the highest existing id, which
  // would hand out the id of a deleted last movie again
  const [sequence] = await all(db, "SELECT seq FROM sqlite_sequence WHERE name = 'Movies'");

  await exec(db, `CREATE TABLE Movies_new (
    \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
    \`title\` VARCHAR(255) NOT NULL,
    \`alternativeTitle\` VARCHAR(255),
    \`releaseYear\` INTEGER NOT NULL,
    \`rating\` INTEGER,
    \`watchedDate\` DATE,
    \`createdAt\` DATETIME NOT NULL,
    \`updatedAt\` DATETIME NOT NULL
  )`);

  const columns = await tableColumns(db, 'Movies');
  const targets = columns.map(quote).join(', ');
  const values = columns.map((c) => (c === 'rating' ? RATING : quote(c))).join(', ');
  await exec(db, `INSERT INTO Movies_new (${targets}) SELECT ${values} FROM Movies`);

  await exec(db, 'DROP TABLE Movies');
  await exec(db, 'ALTER TABLE Movies_new RENAME TO Movies');

  if (sequence) {
    await exec(db, "DELETE FROM sqlite_sequence WHERE name = 'Movies'");
    await all(db, "INSERT INTO sqlite_sequence (name, seq) VALUES ('Movies', ?)", [sequence.seq]);
  }
};
