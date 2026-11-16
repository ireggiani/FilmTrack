const { exec } = require('../utils/sqlite');

// Series Collection: a Series table shaped like Movies, with its own links to
// the genres, countries, directors and actors that movies use.
//
// sync() would create these on the live database anyway. They're a migration
// so that an uploaded backup from before series existed gets them too, empty:
// restoring it then empties the live series tables, instead of leaving series
// behind whose links point at the restored (different) genres and people.
const LINKS = [
  ['SeriesGenres', 'GenreId', 'Genres'],
  ['SeriesCountries', 'CountryId', 'Countries'],
  ['SeriesDirectors', 'DirectorId', 'Directors'],
  ['SeriesActors', 'ActorId', 'Actors']
];

exports.up = async (db) => {
  await exec(db, `CREATE TABLE IF NOT EXISTS Series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    alternativeTitle VARCHAR(255),
    releaseYear INTEGER NOT NULL,
    rating INTEGER,
    watchedDate DATE,
    posterExt VARCHAR(255),
    posterVersion INTEGER,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
  )`);

  for (const [table, key, target] of LINKS) {
    await exec(db, `CREATE TABLE IF NOT EXISTS ${table} (
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      SeriesId INTEGER NOT NULL REFERENCES Series (id) ON DELETE CASCADE ON UPDATE CASCADE,
      ${key} INTEGER NOT NULL REFERENCES ${target} (id) ON DELETE CASCADE ON UPDATE CASCADE,
      PRIMARY KEY (SeriesId, ${key})
    )`);
  }
};
