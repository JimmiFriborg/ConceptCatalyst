# Database Backup Instructions

## Current Database Configuration
- **Type**: PostgreSQL (provided by Replit)
- **Storage**: In-memory with persistence to global object
- **Schema**: Defined in `shared/schema.ts`

## Database Schema Export
The complete database structure is defined in:
- `shared/schema.ts` - All table definitions, types, and schemas
- `drizzle.config.ts` - Database configuration
- `server/storage.ts` - Storage interface and in-memory implementation

## To Backup/Restore Database:

### 1. Schema Migration
```bash
# Push current schema to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate
```

### 2. Data Export (Manual)
Since we're using in-memory storage with persistence, your data is stored in the global object. To export:
1. Data automatically persists to `global.persistedAppData`
2. Check console logs for "Data persisted: X projects, Y features, Z suggestions"

### 3. For Production Setup
If moving to a persistent PostgreSQL database:
1. Update `DATABASE_URL` in environment variables
2. Run `npm run db:push` to create tables
3. Import data using the storage interface methods

## Current Data Persistence
- **Projects**: Stored in memory, persisted automatically
- **Features**: Linked to projects via projectId
- **AI Suggestions**: Linked to projects via projectId
- **Users**: Basic user system ready for authentication

## Environment Variables Needed
- `DATABASE_URL` - PostgreSQL connection string
- `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGHOST` - Individual DB components