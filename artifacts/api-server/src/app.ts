import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import assessmentRoutes from './routes/assessments';
import safeCareersRoutes from './routes/safeCareers';
import learningRoutes from './routes/learning';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

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

export default app;
