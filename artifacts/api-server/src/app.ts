import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Routes
import assessmentRoutes from './routes/assessments';
import safeCareersRoutes from './routes/safeCareers';
import learningRoutes from './routes/learning';
import learningPathsRoutes from './routes/learningPaths';
import liveDataRoutes from './routes/liveData';
import resourceRoutes from './routes/resources';
import digestRoutes from './routes/digest';
import waitlistRoutes from './routes/waitlist';
import roadmapRoutes from './routes/roadmap';
import forecastRoutes from './routes/forecast';

import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ── Security: CORS ──────────────────────────────────────────────
// BUG FIX: Production domain was missing from default allowedOrigins
// causing ALL requests from the deployed frontend to fail CORS.
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://humanproof.ai',
  'https://www.humanproof.ai',
  'https://humanproof.vercel.app',
];
const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and Postman testing
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-client-info', 'x-supabase-auth', 'apikey'],
}));

// Pre-flight support now handled globally by app.use(cors(...)) above

// ── Security: Rate Limiting ─────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                    // increased to 200 for UX
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again in 15 minutes.' },
});

// Stricter limit for AI generation (OpenAI cost protection)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                     // 10 AI generates per IP per hour
  message: { error: 'AI generation rate limit reached. Try again in 1 hour.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '2.0.0' });
});

// ── AI Rate Limiter — MUST be registered BEFORE route mounting ──────
// BUG-06 FIX: Express middleware order is critical. Applying aiLimiter
// after route mounting means the route handler runs first, bypassing the limiter.
// Registering BEFORE mounting ensures the limiter intercepts the request first.
app.use('/api/learning-paths/generate', aiLimiter);
app.use('/api/v1/learning-paths/generate', aiLimiter);

// ── API Routes ──────────────────────────────────────────────────
// v1 prefix routes (primary)
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/safe-careers', safeCareersRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/learning-paths', learningPathsRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/live-data', liveDataRoutes);
app.use('/api/v1/digest', digestRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/forecast', forecastRoutes);

// Legacy unversioned routes (backward compat — keep until frontend migrated)
app.use('/api/assessments', assessmentRoutes);
app.use('/api/safe-careers', safeCareersRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/learning-paths', learningPathsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/live-data', liveDataRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/forecast', forecastRoutes);

// ── Error Handling ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
