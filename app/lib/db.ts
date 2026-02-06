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
      status TEXT NOT NULL CHECK(status IN ('pending', 'received')),
      flow TEXT NOT NULL CHECK(flow IN ('request', 'pay')),
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )
  `);

    // Run migrations for existing databases
    migrateSchema(database);

    // Create indexes for better query performance
    database.exec(`
    CREATE INDEX IF NOT EXISTS idx_pays_contact_id ON pays(contact_id);
    CREATE INDEX IF NOT EXISTS idx_pays_status ON pays(status);
    CREATE INDEX IF NOT EXISTS idx_pays_flow ON pays(flow);
    CREATE INDEX IF NOT EXISTS idx_pays_date ON pays(date);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  `);
}

function migrateSchema(database: Database.Database) {
    try {
        // Check if pays table exists
        const tableExists = database.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='pays'
        `).get() as { name: string } | undefined;

        if (!tableExists) {
            // Table doesn't exist yet, it will be created with the new schema
            return;
        }

        const tableInfo = database.prepare(`PRAGMA table_info(pays)`).all() as Array<{ name: string; type: string }>;
        const columns = tableInfo.map(col => col.name);

        // Migration 1: Add note column if it doesn't exist
        if (!columns.includes('note')) {
            database.exec(`ALTER TABLE pays ADD COLUMN note TEXT;`);
        }

        // Migration 2: Check if we need to recreate the table for constraint updates
        // We need to recreate if: flow column doesn't exist
        // Note: We can't directly check CHECK constraints in SQLite, but if flow doesn't exist,
        // the table was created with the old schema and needs to be recreated
        const needsRecreation = !columns.includes('flow');

        if (needsRecreation) {
            // Recreate the table with the new schema
            console.log('Migrating pays table to new schema...');

            // Step 1: Create a backup table with old data
            database.exec(`
                CREATE TABLE pays_backup AS SELECT * FROM pays;
            `);

            // Step 2: Drop the old table
            database.exec(`DROP TABLE pays;`);

            // Step 3: Create the new table with updated constraints
            database.exec(`
                CREATE TABLE pays (
                  id TEXT PRIMARY KEY,
                  contact_id TEXT NOT NULL,
                  amount INTEGER NOT NULL,
                  status TEXT NOT NULL CHECK(status IN ('pending', 'received')),
                  flow TEXT NOT NULL CHECK(flow IN ('request', 'pay')),
                  date TEXT NOT NULL,
                  note TEXT,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (contact_id) REFERENCES contacts(id)
                )
            `);

            // Step 4: Migrate data from backup
            const backupData = database.prepare(`SELECT * FROM pays_backup`).all() as Array<{
                id: string;
                contact_id: string;
                amount: number;
                status: string;
                date: string;
                note?: string | null;
                created_at?: string;
            }>;

            const insertPay = database.prepare(`
                INSERT INTO pays (id, contact_id, amount, status, flow, date, note, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const transaction = database.transaction((pays) => {
                for (const pay of pays) {
                    // Migrate status: 'paid' -> 'received'
                    const newStatus = pay.status === 'paid' ? 'received' : pay.status;
                    // Default flow to 'pay' for existing records
                    const flow = 'pay';
                    insertPay.run(
                        pay.id,
                        pay.contact_id,
                        pay.amount,
                        newStatus,
                        flow,
                        pay.date,
                        pay.note || null,
                        pay.created_at || null
                    );
                }
            });

            transaction(backupData);

            // Step 5: Drop the backup table
            database.exec(`DROP TABLE pays_backup;`);

            console.log(`✅ Migrated ${backupData.length} pays records`);
        } else {
            // Table already has flow column, but we might still have the old status constraint
            // Try to detect this by checking if we can query for 'received' status
            // If the constraint is old, we need to recreate the table
            try {
                // Try a test query that would fail with old constraint
                // Actually, we can't easily test this, so let's check the table schema SQL
                const tableSql = database.prepare(`
                    SELECT sql FROM sqlite_master 
                    WHERE type='table' AND name='pays'
                `).get() as { sql: string } | undefined;

                const hasOldConstraint = tableSql?.sql?.includes("status IN ('pending', 'paid')");

                if (hasOldConstraint) {
                    // Need to recreate table with new constraint
                    console.log('Detected old status constraint, recreating pays table...');

                    // Create backup
                    database.exec(`CREATE TABLE pays_backup AS SELECT * FROM pays;`);

                    // Drop old table
                    database.exec(`DROP TABLE pays;`);

                    // Create new table
                    database.exec(`
                        CREATE TABLE pays (
                          id TEXT PRIMARY KEY,
                          contact_id TEXT NOT NULL,
                          amount INTEGER NOT NULL,
                          status TEXT NOT NULL CHECK(status IN ('pending', 'received')),
                          flow TEXT NOT NULL CHECK(flow IN ('request', 'pay')),
                          date TEXT NOT NULL,
                          note TEXT,
                          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (contact_id) REFERENCES contacts(id)
                        )
                    `);

                    // Migrate data
                    const backupData = database.prepare(`SELECT * FROM pays_backup`).all() as Array<{
                        id: string;
                        contact_id: string;
                        amount: number;
                        status: string;
                        flow: string;
                        date: string;
                        note?: string | null;
                        created_at?: string;
                    }>;

                    const insertPay = database.prepare(`
                        INSERT INTO pays (id, contact_id, amount, status, flow, date, note, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);

                    const transaction = database.transaction((pays) => {
                        for (const pay of pays) {
                            const newStatus = pay.status === 'paid' ? 'received' : pay.status;
                            const flow = pay.flow || 'pay';
                            insertPay.run(
                                pay.id,
                                pay.contact_id,
                                pay.amount,
                                newStatus,
                                flow,
                                pay.date,
                                pay.note || null,
                                pay.created_at || null
                            );
                        }
                    });

                    transaction(backupData);
                    database.exec(`DROP TABLE pays_backup;`);
                    console.log(`✅ Recreated pays table and migrated ${backupData.length} records`);
                } else {
                    // Table is good, just ensure data is migrated
                    // Migration 3: Update status from 'paid' to 'received' if needed
                    const hasPaidStatus = database.prepare(`SELECT COUNT(*) as count FROM pays WHERE status = 'paid'`).get() as { count: number };
                    if (hasPaidStatus.count > 0) {
                        database.prepare(`UPDATE pays SET status = 'received' WHERE status = 'paid'`).run();
                    }

                    // Ensure all records have a flow value (shouldn't be needed, but just in case)
                    const hasNullFlow = database.prepare(`SELECT COUNT(*) as count FROM pays WHERE flow IS NULL`).get() as { count: number };
                    if (hasNullFlow.count > 0) {
                        database.prepare(`UPDATE pays SET flow = 'pay' WHERE flow IS NULL`).run();
                    }
                }
            } catch (error) {
                console.error('Error checking/updating table constraints:', error);
                // Continue anyway - the error will surface when trying to insert
            }
        }
    } catch (error) {
        console.error('Error during schema migration:', error);
        // Don't throw - allow the app to continue even if migration fails
    }
}

// Close database connection (useful for cleanup)
export function closeDb() {
    if (db) {
        db.close();
    }
}

