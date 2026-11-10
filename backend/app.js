const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { corsOrigins } = require('./config');

/**
 * Build the Express application.
 *
 * Separated from index.js so tests can drive it with an ephemeral loopback
 * port instead of the real one. Nothing here calls `listen`: the bind address
 * is decided in index.js and defaults to 127.0.0.1.
 *
 * Audience note: every note route sits behind `fetchuser`, and the queries are
 * scoped to the authenticated user's id, so one account cannot read or edit
 * another's notes. Only `/api/health` and the two credential endpoints are
 * reachable anonymously.
 */
function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // One proxy hop on Render and similar hosts, so req.ip is the real client
  // address for the limiters. Trusting every hop would let a caller spoof
  // X-Forwarded-For and bypass them.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // A JSON API on a different origin from the SPA: nothing here is ever
      // loaded as a subresource, so deny everything.
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          'default-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'none'"],
          'form-action': ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    })
  );

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX || 600),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });

  // Tighter ceiling on credentials, keyed on IP plus the submitted email so one
  // attacker behind a shared address cannot lock out everyone else. Successes
  // count too, so a valid login cannot refill an attacker's budget.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      return `${req.ip || 'unknown'}:${email}`;
    },
    message: {
      success: false,
      error: 'Too many authentication attempts, please try again in 15 minutes.',
    },
  });

  app.use(globalLimiter);

  // Liveness: the process is accepting connections. Deliberately independent of
  // Mongo, so a transient database blip does not make a platform restart a
  // healthy process.
  app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

  // Readiness: Mongoose reports connection state 1 only once it is usable.
  app.get('/api/health/ready', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const state = states[mongoose.connection.readyState] || 'unknown';
    if (mongoose.connection.readyState === 1) {
      return res.json({ ok: true, database: state });
    }
    res.set('Retry-After', '30');
    return res.status(503).json({ ok: false, database: state });
  });

  app.use('/api/auth', authLimiter, require('./routes/auth'));
  app.use('/api/notes', require('./routes/notes'));

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Malformed JSON bodies and anything unexpected. The real error is logged;
  // the client gets a generic message so nothing internal leaks.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error('Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };
