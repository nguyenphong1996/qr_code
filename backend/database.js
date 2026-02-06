const sqlite3 = require('sqlite3').verbose();

console.log('Connecting to SQLite database...');
const db = new sqlite3.Database('./devices.db', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite');
});

// Wrap db methods with promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Initialize database with proper async/await
const initDatabase = async () => {
  try {
    // Create table
    await dbRun(`CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      ip TEXT, 
      port INTEGER, 
      path TEXT, 
      last_url TEXT, 
      device_type TEXT, 
      branch TEXT
    )`);
    
    console.log('✓ Table created');

    // Check existing columns
    const rows = await dbAll("PRAGMA table_info(devices)");
    const existing = rows.map((row) => row.name);
    
    const needed = [
      { name: 'ip', type: 'TEXT' },
      { name: 'port', type: 'INTEGER' },
      { name: 'path', type: 'TEXT' },
      { name: 'last_url', type: 'TEXT' },
      { name: 'device_type', type: 'TEXT' },
      { name: 'branch', type: 'TEXT' },
    ];

    // Add missing columns
    for (const col of needed) {
      if (!existing.includes(col.name)) {
        try {
          await dbRun(`ALTER TABLE devices ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✓ Added column: ${col.name}`);
        } catch (e) {
          console.warn(`⚠ Column ${col.name} add failed (may exist):`, e.message);
        }
      }
    }

    // Create unique index
    try {
      await dbRun("CREATE UNIQUE INDEX IF NOT EXISTS idx_name_branch ON devices(name, branch)");
      console.log('✓ Unique index created');
    } catch (e) {
      console.warn('⚠ Index creation failed (may exist):', e.message);
    }

    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('✗ Database initialization failed:', err.message);
    throw err;
  }
};

// Initialize immediately
initDatabase().catch((err) => {
  console.error('FATAL: Database init failed, exiting', err);
  process.exit(1);
});

module.exports = db;
