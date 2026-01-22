const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./devices.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)");

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
  });
});

module.exports = db;
