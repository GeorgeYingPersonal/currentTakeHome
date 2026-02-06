import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Get the database file path
const dbPath = path.join(process.cwd(), 'data', 'cpay.db');

// Create database connection
let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        // Ensure the data directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL'); // Enable WAL mode for better concurrency

        // Initialize schema
        initializeSchema(db);
    }
    return db;
}

function initializeSchema(database: Database.Database) {
    // Create contacts table
    database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image_url TEXT NOT NULL
    )
  `);

    // Create pays table
    database.exec(`
    CREATE TABLE IF NOT EXISTS pays (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'paid')),
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )
  `);

    // Add note column if it doesn't exist (for existing databases)
    try {
        const tableInfo = database.prepare(`PRAGMA table_info(pays)`).all() as Array<{ name: string }>;
        const hasNoteColumn = tableInfo.some(col => col.name === 'note');

        if (!hasNoteColumn) {
            database.exec(`ALTER TABLE pays ADD COLUMN note TEXT;`);
        }
    } catch (error) {
        // If table doesn't exist yet, that's fine - it will be created above
        console.error('Error checking/adding note column:', error);
    }

    // Create indexes for better query performance
    database.exec(`
    CREATE INDEX IF NOT EXISTS idx_pays_contact_id ON pays(contact_id);
    CREATE INDEX IF NOT EXISTS idx_pays_status ON pays(status);
    CREATE INDEX IF NOT EXISTS idx_pays_date ON pays(date);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  `);
}

// Close database connection (useful for cleanup)
export function closeDb() {
    if (db) {
        db.close();
    }
}

