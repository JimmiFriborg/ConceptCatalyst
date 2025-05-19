-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);

-- Update users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image_url" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar DEFAULT 'user' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferences" jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add new categories/priorities
-- Rename category to priority in the UI (keep the same database field for now)
-- Add new options to the existing enum
ALTER TABLE "features" ALTER COLUMN "category" TYPE varchar;
ALTER TABLE "ai_suggestions" ALTER COLUMN "suggested_category" TYPE varchar;

-- Update projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "user_id" varchar REFERENCES "users"("id");
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "type" varchar DEFAULT 'project';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "concept_category" varchar;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'planning';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deadline" varchar;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "public" boolean DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "ai_optimized" boolean DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "ai_model_requirements" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "ai_ethical_considerations" jsonb DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "technical_requirements" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Update features table
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "user_id" varchar REFERENCES "users"("id");
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "user_benefit" text;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "implementation_complexity" varchar DEFAULT 'medium';
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "is_ai_feature" boolean DEFAULT false;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "ai_capabilities" jsonb DEFAULT '[]';
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "ai_integration_points" text;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "dependencies" jsonb DEFAULT '[]';
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Create dedicated concepts table
CREATE TABLE IF NOT EXISTS "concepts" (
  "id" serial PRIMARY KEY,
  "user_id" varchar REFERENCES "users"("id"),
  "name" varchar NOT NULL,
  "description" text NOT NULL,
  "concept_category" varchar DEFAULT 'other',
  "target_audience" text,
  "inspirations" jsonb DEFAULT '[]',
  "potential_features" jsonb DEFAULT '[]',
  "is_ai_concept" boolean DEFAULT false,
  "ai_potential" text,
  "tags" jsonb DEFAULT '[]',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_projects_user_id" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_features_project_id" ON "features" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_features_user_id" ON "features" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_concepts_user_id" ON "concepts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_project_id" ON "ai_suggestions" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_expire" ON "sessions" ("expire");