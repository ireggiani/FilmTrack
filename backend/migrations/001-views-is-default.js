const { exec, tableColumns } = require('../utils/sqlite');

// The starred view. Backups from before saved views have no views table.
exports.up = async (db) => {
  const columns = await tableColumns(db, 'views');
  if (!columns.length || columns.includes('isDefault')) return;
  await exec(db, 'ALTER TABLE views ADD COLUMN isDefault TINYINT(1) NOT NULL DEFAULT 0');
};
