import { Pool } from "pg";

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString });

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Applying learning_hub schema additions...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text NOT NULL,
        target_role_key text,
        target_dimension text,
        difficulty_level text NOT NULL DEFAULT 'beginner',
        estimated_hours integer DEFAULT 0,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS path_resources (
        path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
        resource_id uuid NOT NULL REFERENCES free_resources(id) ON DELETE CASCADE,
        order_index integer NOT NULL DEFAULT 0,
        is_required boolean NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS user_path_enrollments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
        status text NOT NULL DEFAULT 'in_progress',
        enrolled_at timestamp DEFAULT now() NOT NULL,
        completed_at timestamp
      );

      CREATE TABLE IF NOT EXISTS user_resource_progress (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        resource_id uuid NOT NULL REFERENCES free_resources(id) ON DELETE CASCADE,
        status text NOT NULL DEFAULT 'not_started',
        is_bookmarked boolean NOT NULL DEFAULT false,
        started_at timestamp DEFAULT now() NOT NULL,
        completed_at timestamp
      );

      ALTER TABLE free_resources ADD COLUMN IF NOT EXISTS rating real DEFAULT 0 NOT NULL;
      ALTER TABLE free_resources ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0 NOT NULL;
    `);

    console.log("✅ Migration complete.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
