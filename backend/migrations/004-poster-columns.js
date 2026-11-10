const { exec } = require('../utils/sqlite');

// Which poster a movie has: posterExt rebuilds the file name, posterVersion is
// the URL's cache-buster, and both are null with no poster. They're left empty
// here because a migration may be running on an uploaded backup, far from the
// posters folder: reconcilePosters fills them in.
exports.up = async (db) => {
  await exec(db, 'ALTER TABLE Movies ADD COLUMN posterExt VARCHAR(255)');
  await exec(db, 'ALTER TABLE Movies ADD COLUMN posterVersion INTEGER');
};
