const { exec } = require('../utils/sqlite');

// A name can appear once per table, ignoring case. The tables are independent:
// the same person can be both an actor and a director.
//
// Old duplicates merge into the one with the lowest id, which takes over their
// movies. Foreign keys are off here, so their links must be removed by hand.
const TABLES = [
  { table: 'Actors', links: 'MovieActors', key: 'ActorId', index: 'actors_name_unique' },
  { table: 'Directors', links: 'MovieDirectors', key: 'DirectorId', index: 'directors_name_unique' }
];

exports.up = async (db) => {
  for (const { table, links, key, index } of TABLES) {
    const kept = `SELECT MIN(id) FROM ${table} GROUP BY name COLLATE NOCASE`;

    await exec(db, `UPDATE ${table} SET name = trim(name)`);
    // OR IGNORE: a movie linked to both duplicates keeps a single link
    await exec(db, `UPDATE OR IGNORE ${links} SET ${key} = (
      SELECT MIN(same.id) FROM ${table} same
      JOIN ${table} current ON current.name = same.name COLLATE NOCASE
      WHERE current.id = ${links}.${key}
    )`);
    await exec(db, `DELETE FROM ${links} WHERE ${key} NOT IN (${kept})`);
    await exec(db, `DELETE FROM ${table} WHERE id NOT IN (${kept})`);
    await exec(db, `CREATE UNIQUE INDEX ${index} ON ${table} (name COLLATE NOCASE)`);
  }
};
