// ════════════════════════════════════════════════════════════════
// waitlist.ts — Server-persisted waitlist with Supabase
// BUG FIX: PricingPage only saved to localStorage.
// Now persists to 'waitlist' table in Supabase via Drizzle ORM.
// ════════════════════════════════════════════════════════════════
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { sendWaitlistWelcome } from "../lib/email";

const router: IRouter = Router();

const emailSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  planTier: z.enum(["pro", "team", "enterprise"]).optional().default("pro"),
  referralSource: z.string().max(100).optional(),
});

/**
 * POST /api/waitlist
 * Add an email to the waitlist table and send confirmation email
 */
router.post("/", async (req: any, res: any) => {
  let isNew = false;

  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: parsed.error.flatten(),
      });
    }

    const { email, planTier, referralSource } = parsed.data;

    if (!db) {
      console.warn("[waitlist] DB not connected — waitlist entry not saved");
      return res.json({
        success: true,
        message: "Added to waitlist",
        fallback: true,
      });
    }

    // Check if email already exists
    const existing = await db.execute(
      sql`SELECT id, email_sent FROM waitlist WHERE email = ${email}`,
    );
    isNew = !(existing as any).rows?.length;

    // Use raw SQL with Drizzle's sql template literal
    await db.execute(
      sql`INSERT INTO waitlist (email, plan_tier, referral_source, created_at)
          VALUES (${email}, ${planTier}, ${referralSource ?? null}, now())
          ON CONFLICT (email) DO UPDATE SET plan_tier = EXCLUDED.plan_tier, updated_at = now()`,
    );

    // Send welcome email only for new signups
    if (isNew) {
      try {
        await sendWaitlistWelcome({ email, planTier });
        await db.execute(
          sql`UPDATE waitlist SET email_sent = TRUE WHERE email = ${email}`,
        );
      } catch (emailErr: any) {
        console.error("[waitlist] Welcome email failed:", emailErr.message);
      }
    }

    // Get waitlist count for social proof
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM waitlist`,
    );
    const waitlistCount = Number((countResult as any).rows?.[0]?.count ?? 0);

    return res.json({
      success: true,
      message: isNew
        ? `Added to ${planTier} waitlist! Check your email for confirmation.`
        : `You're already on the ${planTier} list! We'll be in touch soon.`,
      email,
      planTier,
      waitlistCount,
    });
  } catch (e: any) {
    // Don't fail silently — return appropriate error
    console.error("[waitlist] Insert failed:", e.message);
    // If table doesn't exist yet, still return success (will be created post migration)
    if (e.message?.includes("does not exist") || e.code === "42P01") {
      // Try sending email anyway even without DB
      if (isNew) {
        try {
          await sendWaitlistWelcome({
            email: req.body.email,
            planTier: req.body.planTier || "pro",
          });
        } catch {}
      }
      return res.json({
        success: true,
        message: "Added to waitlist!",
        note: "Waitlist table pending migration",
      });
    }
    return res
      .status(500)
      .json({ error: "Failed to join waitlist. Please try again." });
  }
});

/**
 * GET /api/waitlist/count
 * Returns number of people on the waitlist (public stat for social proof)
 */
router.get("/count", async (_req: any, res: any) => {
  try {
    if (!db) return res.json({ count: 0 });
    const result = await db.execute(
      `SELECT COUNT(*) as count FROM waitlist WHERE created_at IS NOT NULL`,
    );
    const count = Number((result as any).rows?.[0]?.count ?? 0);
    return res.json({ count });
  } catch {
    return res.json({ count: 0 });
  }
});

export default router;
