const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./devices.db');

// Initialize database with proper error handling
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, ip TEXT, port INTEGER, path TEXT, last_url TEXT, device_type TEXT, branch TEXT)", (err) => {
        if (err) {
          console.error('Failed to create devices table:', err.message);
          reject(err);
          return;
        }

        // Ensure new columns exist without dropping data
        db.all("PRAGMA table_info(devices)", (err, rows) => {
          if (err) {
            console.error('Failed to inspect devices schema', err.message);
            reject(err);
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

          const columnsToAdd = needed.filter((col) => !existing.includes(col.name));
          
          if (columnsToAdd.length === 0) {
            // All columns exist, create index and resolve
            db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_name_branch ON devices(name, branch)", (idxErr) => {
              if (idxErr && !idxErr.message.includes('already exists')) {
                console.warn('Note: Unique index for (name, branch) could not be created:', idxErr.message);
              }
              resolve();
            });
            return;
          }

          let completed = 0;
          columnsToAdd.forEach((col) => {
            db.run(`ALTER TABLE devices ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
              completed++;
              if (alterErr && !alterErr.message.includes('already exists')) {
                console.error(`Failed to add column ${col.name}:`, alterErr.message);
              }
              
              if (completed === columnsToAdd.length) {
                // All columns added, now create index
                db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_name_branch ON devices(name, branch)", (idxErr) => {
                  if (idxErr && !idxErr.message.includes('already exists')) {
                    console.warn('Note: Unique index for (name, branch) could not be created:', idxErr.message);
                  }
                  resolve();
                });
              }
            });
          });
        });
      });
    });
  });
};

// Initialize database on startup
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = db;
