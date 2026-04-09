import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../lib/db/src/schema/index";
import { eq } from "drizzle-orm";

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function seed() {
  try {
    console.log("Seeding initial learning paths...");

    // Find some free resources to link
    const resources = await db.select().from(schema.freeResources).limit(10);
    if (resources.length === 0) {
      console.log("No free resources found. Please seed resources first.");
      process.exit(0);
    }

    // Identify roles to target
    const targetRole = "sw_developer";

    // Insert Learning Path
    const [path] = await db.insert(schema.learningPaths).values({
      title: "AI Transition for Software Engineers",
      description: "A comprehensive path for software developers to build AI augmentation skills and avoid displacement.",
      targetRoleKey: targetRole,
      targetDimension: "D2",
      difficultyLevel: "intermediate",
      estimatedHours: 25,
    }).returning();

    console.log(`Created learning path: ${path.title}`);

    // Link resources to the path
    let order = 1;
    for (const r of resources.slice(0, 5)) {
      await db.insert(schema.pathResources).values({
        pathId: path.id,
        resourceId: r.id,
        orderIndex: order++,
        isRequired: true,
      });
    }

    console.log("✅ Successfully seeded learning paths and linked resources.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    pool.end();
  }
}

seed();
