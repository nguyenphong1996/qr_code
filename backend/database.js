const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./devices.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, ip TEXT, port INTEGER, path TEXT, last_url TEXT, device_type TEXT, branch TEXT)");

  // Ensure new columns exist without dropping data
  db.all("PRAGMA table_info(devices)", (err, rows) => {
    if (err) {
      console.error('Failed to inspect devices schema', err.message);
      return;
    }
    const existing = rows.map((row) => row.name);
    const needed = [
      { name: 'ip', type: 'TEXT' },
      { name: 'port', type: 'INTEGER' },
      { name: 'path', type: 'TEXT' },
      { name: 'last_url', type: 'TEXT' },
      { name: 'device_type', type: 'TEXT' },
      { name: 'branch', type: 'TEXT' },
    ];

    needed
      .filter((col) => !existing.includes(col.name))
      .forEach((col) => {
        db.run(`ALTER TABLE devices ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
          if (alterErr) {
            console.error(`Failed to add column ${col.name}`, alterErr.message);
          }
        });
      });

    // Create unique constraint for (name, branch) pair if it doesn't exist
    db.all("SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_name_branch'", (indexErr, indexRows) => {
      if (!indexErr && (!indexRows || indexRows.length === 0)) {
        db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_name_branch ON devices(name, branch)", (idxErr) => {
          if (idxErr) {
            console.log('Note: Unique index for (name, branch) could not be created - may already exist or table has duplicates');
          } else {
            console.log('Created unique index for (name, branch)');
          }
        });
      }
    });
  });
});

module.exports = db;
