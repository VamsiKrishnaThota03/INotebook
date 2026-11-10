/**
 * API tests for the iNotebook backend.
 *
 * CI previously only ran `node --check index.js` plus a couple of `require`
 * calls, which proves the files parse and nothing else. These drive the real
 * Express app and cover the behaviour that matters: that notes are scoped to
 * their owner, that token forgery is rejected, and that the probes and limiters
 * behave.
 *
 * Mongoose is never connected, so every route that touches the database is
 * expected to fail downstream — the assertions here are about the middleware
 * that runs *before* the database, plus the liveness/readiness split. The
 * owner-scoping tests run against a real MongoDB in CI via the `integration`
 * job.
 */
process.env.JWT_SECRET = 'test-only-secret-not-used-in-any-deployment';
process.env.AUTH_RATE_LIMIT_MAX = '4';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Fail queries immediately instead of sitting in Mongoose's 10s buffer; the
// middleware under test runs before the query either way.
mongoose.set('bufferCommands', false);

const { createApp } = require('../app');

let server;
let base;

before(async () => {
  // Loopback explicitly: an ephemeral port on all interfaces would briefly
  // expose the test server to the local network.
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const call = (path, { method = 'GET', headers = {}, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

test('the test server listens only on loopback', () => {
  assert.strictEqual(server.address().address, '127.0.0.1');
});

test('liveness answers without a database connection', async () => {
  assert.strictEqual(mongoose.connection.readyState, 0);
  const res = await call('/api/health');
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.ok, true);
  assert.strictEqual(typeof body.uptime, 'number');
});

test('readiness reports 503 with Retry-After while Mongo is disconnected', async () => {
  const res = await call('/api/health/ready');
  assert.strictEqual(res.status, 503);
  assert.strictEqual(res.headers.get('retry-after'), '30');
  const body = await res.json();
  assert.strictEqual(body.ok, false);
  assert.strictEqual(body.database, 'disconnected');
});

test('security headers are set and the server is not fingerprintable', async () => {
  const res = await call('/api/health');
  assert.strictEqual(res.headers.get('x-powered-by'), null);
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('content-security-policy'), /default-src 'none'/);
  assert.strictEqual(res.headers.get('referrer-policy'), 'no-referrer');
});

test('rate limit responses use the draft-7 header, not the legacy ones', async () => {
  const res = await call('/api/health');
  assert.ok(res.headers.get('ratelimit') || res.headers.get('ratelimit-limit'));
  assert.strictEqual(res.headers.get('x-ratelimit-limit'), null);
});

test('note routes reject a missing token', async () => {
  for (const [path, method] of [
    ['/api/notes/fetchnotes', 'GET'],
    ['/api/notes/createnote', 'POST'],
    ['/api/notes/updatenote/507f1f77bcf86cd799439011', 'PUT'],
    ['/api/notes/deletenote/507f1f77bcf86cd799439011', 'DELETE'],
  ]) {
    const res = await call(path, { method, body: method === 'GET' ? undefined : {} });
    assert.strictEqual(res.status, 401, `${method} ${path} should require a token`);
  }
});

test('note routes reject a token signed with the wrong key', async () => {
  const forged = jwt.sign({ user: { id: '507f1f77bcf86cd799439011' } }, 'a-different-secret');
  const res = await call('/api/notes/fetchnotes', {
    headers: { 'auth-token': forged },
  });
  assert.strictEqual(res.status, 401);
});

test('a token with alg=none is rejected', async () => {
  // Guards against the classic algorithm-confusion bypass.
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ user: { id: 'x' } })).toString('base64url');
  const res = await call('/api/notes/fetchnotes', {
    headers: { 'auth-token': `${header}.${payload}.` },
  });
  assert.strictEqual(res.status, 401);
});

test('registration validates name, email and password before touching the database', async () => {
  const cases = [
    { name: 'ab', email: 'a@b.co', password: 'secret' }, // name too short
    { name: 'Valid Name', email: 'not-an-email', password: 'secret' },
    { name: 'Valid Name', email: 'a@b.co', password: '123' }, // password too short
  ];
  for (const body of cases) {
    const res = await call('/api/auth/createuser', { method: 'POST', body });
    assert.strictEqual(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(Array.isArray(json.errors));
  }
});

test('login validates its input', async () => {
  const res = await call('/api/auth/login', {
    method: 'POST',
    body: { email: 'not-an-email', password: '' },
  });
  assert.strictEqual(res.status, 400);
});

test('the auth limiter fires and keys on IP plus email', async () => {
  // AUTH_RATE_LIMIT_MAX is 4 in this suite.
  const attempt = (email) =>
    call('/api/auth/login', { method: 'POST', body: { email, password: 'wrong-password' } });

  let sawLimit = false;
  for (let i = 0; i < 8; i += 1) {
    const res = await attempt('target@example.test');
    if (res.status === 429) {
      sawLimit = true;
      break;
    }
  }
  assert.ok(sawLimit, 'expected a 429 once the auth limit was exceeded');

  // A different email from the same IP is a separate bucket.
  const other = await attempt('someone-else@example.test');
  assert.notStrictEqual(other.status, 429);
});

test('an unknown route returns a JSON 404', async () => {
  const res = await call('/api/does-not-exist');
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.error, 'Not found');
});

test('malformed JSON produces a 400, not a 500', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"email": broken',
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /Invalid JSON/);
});
