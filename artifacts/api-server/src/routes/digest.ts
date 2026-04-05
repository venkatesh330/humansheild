import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

// In-memory store (in production, use database + email service)
interface DigestSubscriber {
  email: string;
  subscriptionDate: number;
  status: 'active' | 'unsubscribed';
}

const subscribers: DigestSubscriber[] = [];

// BUG 5 FIX: Use Zod for proper email validation instead of just checking for '@'
const emailSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

// POST /api/digest/subscribe - Subscribe to weekly digest
router.post("/subscribe", (req: any, res: any) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid email", details: parsed.error.flatten() });
    }
    const { email } = parsed.data;
    const existing = subscribers.find(s => s.email === email);
    if (existing) {
      existing.status = 'active';
      return res.json({ message: "Already subscribed", subscriber: existing });
    }
    const subscriber: DigestSubscriber = {
      email,
      subscriptionDate: Date.now(),
      status: 'active',
    };
    subscribers.push(subscriber);
    return res.json({ message: "Subscribed successfully", subscriber });
  } catch (e) {
    return res.status(500).json({ error: "Failed to subscribe" });
  }
});

// POST /api/digest/unsubscribe - Unsubscribe from digest
router.post("/unsubscribe", (req: any, res: any) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const { email } = parsed.data;
    const subscriber = subscribers.find(s => s.email === email);
    if (!subscriber) {
      return res.status(404).json({ error: "Not subscribed" });
    }
    subscriber.status = 'unsubscribed';
    return res.json({ message: "Unsubscribed successfully" });
  } catch (e) {
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// GET /api/digest/status/:email - Check subscription status
router.get("/status/:email", (req: any, res: any) => {
  try {
    const { email } = req.params;
    const subscriber = subscribers.find(s => s.email === email);
    return res.json({
      email,
      isSubscribed: subscriber?.status === 'active',
      subscriber: subscriber || null,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
