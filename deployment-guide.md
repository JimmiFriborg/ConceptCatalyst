# Deployment Guide

## Critical Information NOT Saved in Code

### 1. Environment Variables / Secrets
- **OPENAI_API_KEY** - Required for AI features
- **DATABASE_URL** - PostgreSQL connection (if using persistent DB)
- **PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST** - Database credentials

### 2. Data Storage
- **In-Memory Data** - Projects, features, and AI suggestions are currently stored in memory
- **Persistence** - Data persists via `global.persistedAppData` object
- **Local Storage** - Custom categories saved in browser localStorage

### 3. Replit-Specific Configuration
- **Port Configuration** - App runs on port 3000, handled by Replit
- **Domain Setup** - Automatic `.replit.app` domain assignment
- **Workflow Configuration** - `npm run dev` command in `.replit` file

## Setup Instructions for New Environment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
- Get OpenAI API key from platform.openai.com
- Set up PostgreSQL database (optional - currently using in-memory)

### 3. Database Setup (if using PostgreSQL)
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

## Production Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Configure database connection (if not using in-memory)
- [ ] Ensure OpenAI API key is valid and has credits
- [ ] Test AI features work with production API key
- [ ] Verify file upload/PDF export functionality
- [ ] Set up proper domain and SSL (handled by Replit Deployments)

## Current Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: In-memory with persistence (easily switchable to PostgreSQL)
- **AI Integration**: OpenAI GPT-4o for suggestions and analysis
- **Build Tool**: Vite for development and production builds