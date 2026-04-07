<<<<<<< HEAD
import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Configure CORS with allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3001'];
=======
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import assessmentRoutes from './routes/assessments';
import safeCareersRoutes from './routes/safeCareers';
import learningRoutes from './routes/learning';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
>>>>>>> audit-fixes-2026-04-07

// Security: CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

<<<<<<< HEAD
// Global rate limit: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in 15 minutes." },
  skip: (req) => process.env.NODE_ENV === 'development', // skip in dev
});

// Strict limiter for write-heavy endpoints (digest subscribe)
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many subscription attempts. Please wait 1 hour." },
  skip: (req) => process.env.NODE_ENV === 'development',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", globalLimiter);
app.use("/api/digest/subscribe", writeLimiter);
app.use("/api", router);
=======
// Security: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

app.use(express.json());

// Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api/safe-careers', safeCareersRoutes);
app.use('/api/learning', learningRoutes);

// Error Handling
app.use(errorHandler);
>>>>>>> audit-fixes-2026-04-07

export default app;

