'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const { HTTP, RATE_LIMIT } = require('./utils/constants');

// Routes
const assistRouter = require('./routes/assist');
const alertRouter = require('./routes/alert');
const navigateRouter = require('./routes/navigate');
const translateRouter = require('./routes/translate');

const app = express();

// Trust Proxy (for rate limiting behind load balancers)
app.set('trust proxy', 1);

// ─── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://ajax.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 years in seconds
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ─── PERMISSIONS POLICY ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ─── COMPRESSION ───────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS (ORIGIN-LOCKED) ─────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:8080'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError('Not allowed by CORS', HTTP.FORBIDDEN, 'CORS_BLOCKED'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── BODY PARSER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── API RATE LIMITER ─────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Stricter limiter for Gemini-backed endpoints
const geminiLimiter = rateLimit({
  windowMs: RATE_LIMIT.GEMINI_WINDOW_MS,
  limit: RATE_LIMIT.GEMINI_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'GEMINI_RATE_LIMIT_EXCEEDED',
    message: 'Too many AI requests. Please wait 1 minute before trying again.',
  },
});

app.use('/api', apiLimiter);

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
/**
 * GET /health
 * Returns service health status.
 */
app.get('/health', (req, res) => {
  res.status(HTTP.OK).json({
    status: 'healthy',
    service: 'FIFA FanConnect',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/assist', geminiLimiter, assistRouter);
app.use('/api/alert', geminiLimiter, alertRouter);
app.use('/api/navigate', geminiLimiter, navigateRouter);
app.use('/api/translate', geminiLimiter, translateRouter);

// ─── FOOTBALL PAGES (relaxed CSP for Stitch-generated standalone pages) ────────
const footballPages = ['football.html', 'football_shader.html', 'football_threejs.html'];
footballPages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://ajax.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
    );
    res.sendFile(path.join(__dirname, `../public/${page}`));
  });
});

// ─── CATCH-ALL SPA ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || HTTP.INTERNAL_ERROR;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.';

  logger.error({
    event: 'unhandled_error',
    code,
    message: err.message,
    statusCode,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    status: err.status || 'error',
    code,
    message,
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ event: 'server_start', port: PORT, service: 'FIFA FanConnect' });
  });
}

module.exports = app;
