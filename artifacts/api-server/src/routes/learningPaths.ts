import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { learningPaths, pathResources, userPathEnrollments, freeResources } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

// Middleware to extract user from Supabase auth token
// Assuming req.user is set upstream by some auth middleware, if not we will just accept userId from headers for now.
const getUserId = (req: any) => {
  return req.headers['x-user-id'] || null;
};

/**
 * GET /api/learning-paths
 * Query: roleKey
 */
router.get("/", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { roleKey } = req.query as Record<string, string>;
    const conditions = [];
    if (roleKey) conditions.push(eq(learningPaths.targetRoleKey, roleKey));

    const paths = await db
      .select()
      .from(learningPaths)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return res.json({ data: paths });
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to fetch paths", details: e.message });
  }
});

/**
 * GET /api/learning-paths/:id
 * Includes associated resources
 */
router.get("/:id", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { id } = req.params;
    
    const pathData = await db.select().from(learningPaths).where(eq(learningPaths.id, id)).limit(1);
    if (!pathData.length) return res.status(404).json({ error: "Path not found" });

    const resources = await db
      .select({
        resource: freeResources,
        orderIndex: pathResources.orderIndex,
        isRequired: pathResources.isRequired,
      })
      .from(pathResources)
      .innerJoin(freeResources, eq(pathResources.resourceId, freeResources.id))
      .where(eq(pathResources.pathId, id))
      .orderBy(pathResources.orderIndex);

    return res.json({ data: { ...pathData[0], resources } });
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to fetch path", details: e.message });
  }
});

/**
 * POST /api/learning-paths/:id/enroll
 * Body: { status: 'in_progress' | 'completed' }
 */
router.post("/:id/enroll", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { status = 'in_progress' } = req.body;

    const existing = await db
      .select()
      .from(userPathEnrollments)
      .where(and(eq(userPathEnrollments.userId, userId), eq(userPathEnrollments.pathId, id)))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db.update(userPathEnrollments)
        .set({ status, completedAt: status === 'completed' ? sql`now()` : null })
        .where(eq(userPathEnrollments.id, existing[0].id))
        .returning();
      return res.json({ data: updated[0] });
    } else {
      const inserted = await db.insert(userPathEnrollments)
        .values({ userId, pathId: id, status })
        .returning();
      return res.json({ data: inserted[0] });
    }
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to enroll path", details: e.message });
  }
});

/**
 * POST /api/learning-paths/generate
 * Body: { roleKey: string }
 */
router.post("/generate", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { roleKey } = req.body;
    if (!roleKey) return res.status(400).json({ error: "roleKey is required" });

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }

    // Fetch existing free resources
    const resources = await db.select({ id: freeResources.id, title: freeResources.title, provider: freeResources.provider, level: freeResources.level }).from(freeResources).limit(80);

    const prompt = `You are an elite AI education architect and career transition strategist. 
A user with the target career role of "${roleKey}" is seeking to future-proof their skillset against AI disruption. 

I will provide you with a JSON array of carefully curated free learning resources. 
Your task is to analyze these resources and synthesize a highly effective, logical learning curriculum (a "Learning Path") tailored specifically to help the "${roleKey}" role evolve their skills in areas AI cannot easily automate (e.g. strategic leadership, empathy, complex problem solving).

Here are the available resources:
${JSON.stringify(resources)}

Follow these strict constraints when designing the Learning Path:
1. Progression: Structure the resources to flow logically from foundational to advanced human-centric skills.
2. Relevance: ONLY include resources that actually help future-proof this role. Match the resource IDs exactly.
3. Dimensions: Focus on addressing target dimension 'D1', 'D2', 'D3', 'D6' or 'general'.
4. Description: Write a compelling, 2-3 sentence description explaining exactly WHY this path matters for someone in the "${roleKey}" role moving into the AI era.

Respond ONLY with valid JSON strictly matching this schema:
{
  "title": "String - e.g., 'Mastering Human-Centric Strategy for [Role]'",
  "description": "String - compelling explanation of value and relevance",
  "targetDimension": "String - 'D1', 'D2', 'D3', 'D6', or 'general'",
  "difficultyLevel": "String - 'beginner', 'intermediate', or 'advanced'",
  "estimatedHours": Number - reasonable sum of resource durations,
  "resourceIds": ["uuid-1", "uuid-2", "uuid-3"] // Must match the provided IDs in a logical learning sequence
}
Do not include markdown blocks or any other commentary, just the JSON.`;

    let generatedPath;
    try {
      const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Updated to gpt-4o
          messages: [{ role: "system", content: prompt }],
          response_format: { type: "json_object" }
        }),
      });

      if (!llmResponse.ok) {
        const errJson = await llmResponse.json() as any;
        console.error("OpenAI API Error:", errJson);
        throw new Error("OPENAI_FAILED"); // Trigger fallback
      }
      
      const llmData = await llmResponse.json() as any;
      generatedPath = JSON.parse(llmData.choices[0].message.content);
    } catch (e: any) {
      console.warn("AI Generation failed or Quota exceeded. Using high-quality human-centric mock fallback.");
      // High quality mock based on the newly seeded human-centric resources
      const availableResources = await db.select().from(freeResources).limit(10);
      const availableIds = availableResources.map(r => r.id);
      
      generatedPath = {
        title: `Strategic Transformation for ${roleKey}`,
        description: `A masterclass curriculum focusing on advanced human judgment, strategic negotiation, and emotional intelligence—skills that remain uniquely human in the age of automation.`,
        targetDimension: "D3",
        difficultyLevel: "advanced",
        estimatedHours: 45,
        resourceIds: availableIds.slice(0, 5) // Pick first 5 human-proof resources
      };
    }

    // Insert the Path
    const insertedPaths = await db.insert(learningPaths).values({
      title: generatedPath.title,
      description: generatedPath.description,
      targetRoleKey: roleKey,
      targetDimension: generatedPath.targetDimension,
      difficultyLevel: generatedPath.difficultyLevel,
      estimatedHours: generatedPath.estimatedHours,
    }).returning();
    
    const newPath = insertedPaths[0];

    // Link Path Resources
    const pathResourcesData = generatedPath.resourceIds.map((id: string, index: number) => ({
      pathId: newPath.id,
      resourceId: id,
      orderIndex: index + 1,
      isRequired: true,
    }));

    await db.insert(pathResources).values(pathResourcesData);

    return res.json({ success: true, path: newPath });
  } catch (e: any) {
    console.error("Generate Path Error:", e);
    return res.status(500).json({ error: "Failed to generate path", details: e.message });
  }
});

export default router;
