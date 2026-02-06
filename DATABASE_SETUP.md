# Database Setup Guide

This project now uses **SQLite** for data persistence. The database file is stored in the `data/` directory.

## Quick Start

### 1. Install Dependencies

```bash
npm install better-sqlite3 @types/better-sqlite3 tsx
```

### 2. Seed the Database

Run the seed script to populate the database with initial contacts:

```bash
npm run seed
```

This will:
- Create the database file at `data/cpay.db`
- Create the necessary tables (contacts, pays)
- Insert the 6 pre-populated contacts
- Generate sample pays data distributed across the past 12 months

### 3. Start the Development Server

```bash
npm run dev
```

## Database Schema

### Contacts Table
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `image_url` (TEXT, NOT NULL)

### Pays Table
- `id` (TEXT, PRIMARY KEY)
- `contact_id` (TEXT, NOT NULL, FOREIGN KEY → contacts.id)
- `amount` (INTEGER, NOT NULL) - stored in cents
- `status` (TEXT, NOT NULL, CHECK: 'pending' or 'received')
- `flow` (TEXT, NOT NULL, CHECK: 'request' or 'pay')
- `date` (TEXT, NOT NULL) - ISO date string (YYYY-MM-DD)
- `note` (TEXT, NULLABLE) - optional note/description
- `created_at` (TEXT, DEFAULT CURRENT_TIMESTAMP)

## Database Indexes

For better query performance, the following indexes are automatically created:
- `idx_pays_contact_id` - Index on `pays.contact_id`
- `idx_pays_status` - Index on `pays.status`
- `idx_pays_flow` - Index on `pays.flow`
- `idx_pays_date` - Index on `pays.date`
- `idx_contacts_email` - Index on `contacts.email`

## Features

✅ **All data functions now use the database:**
- `fetchContacts()` - Get all contacts
- `fetchFilteredContacts()` - Get contacts with pay statistics
- `fetchLatestPays()` - Get latest 5 pays
- `fetchCardData()` - Get dashboard statistics
- `fetchFilteredPays()` - Get paginated pays with search and filtering
- `fetchPayById()` - Get a single pay by ID
- `fetchPaysPages()` - Get total pages for pagination
- `fetchActivity()` - Get monthly activity data

✅ **Server Actions:**
- `createPay()` - Create a new pay
- `updatePay()` - Update an existing pay
- `deletePay()` - Delete a pay

## Generating Sample Pays

The seed script (`npm run seed`) automatically generates sample pays data distributed across the past 12 months. To generate additional or different sample data, you can:

1. **Use the UI**: Navigate to `/dashboard/pays/create` and create pays manually

2. **Modify the seed script**: Edit `scripts/seed.ts` to adjust the sample data generation logic and run `npm run seed` again (note: this will clear existing data)

3. **Create a custom script**: Write a separate script to generate additional pays data

## Database Location

- **Development**: `data/cpay.db` (in project root)
- **Production**: Same location (or configure for your deployment)

## Switching to PostgreSQL

If you want to use PostgreSQL instead (since `@vercel/postgres` is already installed):

1. Set up a PostgreSQL database (local or hosted)
2. Update `app/lib/db.ts` to use `@vercel/postgres` instead of `better-sqlite3`
3. Update the SQL queries to use PostgreSQL syntax (mostly compatible)
4. Update connection string in environment variables

## Notes

- The database file (`data/cpay.db`) is gitignored
- Amounts are stored in **cents** (integer) to avoid floating-point precision issues
- The database uses WAL (Write-Ahead Logging) mode for better concurrency
- All database operations are synchronous (better-sqlite3 is synchronous)
- The schema includes automatic migrations for existing databases (e.g., adding `note` and `flow` fields, updating status values from 'paid' to 'received')

