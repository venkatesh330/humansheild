import { Router, type IRouter } from "express";

const router: IRouter = Router();

// In-memory store (in production, use database + email service)
interface DigestSubscriber {
  email: string;
  subscriptionDate: number;
  status: 'active' | 'unsubscribed';
}

const subscribers: DigestSubscriber[] = [];

// POST /api/digest/subscribe - Subscribe to weekly digest
router.post("/subscribe", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Invalid email" });
    }
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
    res.json({ message: "Subscribed successfully", subscriber });
  } catch (e) {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// POST /api/digest/unsubscribe - Unsubscribe from digest
router.post("/unsubscribe", (req, res) => {
  try {
    const { email } = req.body;
    const subscriber = subscribers.find(s => s.email === email);
    if (!subscriber) {
      return res.status(404).json({ error: "Not subscribed" });
    }
    subscriber.status = 'unsubscribed';
    res.json({ message: "Unsubscribed successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// GET /api/digest/status/:email - Check subscription status
router.get("/status/:email", (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = subscribers.find(s => s.email === email);
    res.json({
      email,
      isSubscribed: subscriber?.status === 'active',
      subscriber: subscriber || null,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
