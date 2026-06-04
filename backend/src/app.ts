import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, env.NODE_ENV === 'development');
      }
    },
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts' },
});
app.use(`/api/${env.API_VERSION}/auth/login`, authLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hrflow-api' });
});

app.get(`/api/${env.API_VERSION}/docs`, (_req, res) => {
  res.json({
    name: 'HRFlow AI API',
    version: env.API_VERSION,
    documentation: '/docs/API_DOCUMENTATION.md',
    endpoints: [
      'POST /auth/login',
      'GET /platform/companies',
      'POST /attendance/check-in',
      'POST /leave/requests',
      'POST /payroll/generate',
      'POST /ai/chat',
      'POST /webhooks/whatsapp',
    ],
  });
});

app.use(`/api/${env.API_VERSION}`, routes);

app.use(errorHandler);

export default app;
