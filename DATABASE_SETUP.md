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
- `status` (TEXT, NOT NULL, CHECK: 'pending' or 'paid')
- `date` (TEXT, NOT NULL) - ISO date string (YYYY-MM-DD)
- `created_at` (TEXT, DEFAULT CURRENT_TIMESTAMP)

## Features

✅ **All data functions now use the database:**
- `fetchContacts()` - Get all contacts
- `fetchFilteredContacts()` - Get contacts with pay statistics
- `fetchLatestPays()` - Get latest 5 pays
- `fetchCardData()` - Get dashboard statistics
- `fetchFilteredPays()` - Get paginated pays with search
- `fetchPayById()` - Get a single pay by ID
- `fetchPaysPages()` - Get total pages for pagination
- `fetchActivity()` - Get monthly activity data

✅ **Server Actions:**
- `createPay()` - Create a new pay
- `updatePay()` - Update an existing pay
- `deletePay()` - Delete a pay

## Generating Sample Pays

To generate sample pays data, you can:

1. **Use the UI**: Navigate to `/dashboard/pays/create` and create pays manually

2. **Modify the seed script**: Uncomment the sample pays generation code in `scripts/seed.ts` and run `npm run seed` again

3. **Create a script**: Write a script to generate a year's worth of random pays

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

