/**
 * Proves notes are scoped to their owner, against a real MongoDB.
 *
 * This is the assertion that actually matters for a notes app and the one a
 * mock cannot make honestly: user A must not be able to read, edit or delete
 * user B's note, even knowing its id. `routes/notes.js` relies on an `ownNote`
 * middleware plus user-scoped queries, and this test is what keeps that true.
 *
 * Skips itself when TEST_MONGO_URI is absent, so `npm test` still passes on a
 * machine with no database; CI always provides one.
 */
process.env.JWT_SECRET = 'test-only-secret-not-used-in-any-deployment';
// High enough not to trip while the suite creates two accounts.
process.env.AUTH_RATE_LIMIT_MAX = '1000';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const uri = process.env.TEST_MONGO_URI;
const suite = uri ? describe : describe.skip;

suite('note ownership (real MongoDB)', () => {
  let server;
  let base;

  const call = (path, { method = 'GET', headers = {}, body } = {}) =>
    fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  /** Register a throwaway account and return its auth token. */
  async function register(label) {
    const email = `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
    const res = await call('/api/auth/createuser', {
      method: 'POST',
      body: { name: `${label} tester`, email, password: 'correct-horse' },
    });
    assert.strictEqual(res.status, 200, `register failed: ${await res.text()}`);
    const json = await res.json();
    assert.ok(json.authtoken, 'expected an auth token');
    return { token: json.authtoken, email };
  }

  before(async () => {
    await mongoose.connect(uri);
    // Start from a clean slate so a previous run cannot affect assertions.
    await mongoose.connection.db.dropDatabase();

    const { createApp } = require('../app');
    server = createApp().listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    if (server) server.close();
    await mongoose.connection.close();
  });

  test('readiness turns green once Mongo is connected', async () => {
    const res = await call('/api/health/ready');
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.database, 'connected');
  });

  test('registration never returns the password hash', async () => {
    const res = await call('/api/auth/createuser', {
      method: 'POST',
      body: {
        name: 'Hash check',
        email: `hash-${Date.now()}@example.test`,
        password: 'correct-horse',
      },
    });
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(!text.includes('password'), 'response mentioned a password field');
  });

  test('the same email cannot register twice', async () => {
    const { email } = await register('dup');
    const res = await call('/api/auth/createuser', {
      method: 'POST',
      body: { name: 'Imposter', email, password: 'correct-horse' },
    });
    assert.strictEqual(res.status, 400);
  });

  test('login succeeds with the right password and fails with the wrong one', async () => {
    const { email } = await register('login');

    const ok = await call('/api/auth/login', {
      method: 'POST',
      body: { email, password: 'correct-horse' },
    });
    assert.strictEqual(ok.status, 200);
    assert.ok((await ok.json()).authtoken);

    const bad = await call('/api/auth/login', {
      method: 'POST',
      body: { email, password: 'wrong-horse' },
    });
    assert.strictEqual(bad.status, 400);
  });

  test('a note lifecycle works for its owner', async () => {
    const { token } = await register('owner');
    const auth = { 'auth-token': token };

    const created = await call('/api/notes/createnote', {
      method: 'POST',
      headers: auth,
      body: { title: 'My note', description: 'Something private', tag: 'personal' },
    });
    assert.strictEqual(created.status, 200, await created.text());
    const note = await created.json();
    assert.ok(note._id);

    const list = await call('/api/notes/fetchnotes', { headers: auth });
    assert.strictEqual(list.status, 200);
    assert.strictEqual((await list.json()).length, 1);

    const updated = await call(`/api/notes/updatenote/${note._id}`, {
      method: 'PUT',
      headers: auth,
      body: { title: 'My note, edited', description: 'Still private', tag: 'personal' },
    });
    assert.strictEqual(updated.status, 200);

    const deleted = await call(`/api/notes/deletenote/${note._id}`, {
      method: 'DELETE',
      headers: auth,
    });
    assert.strictEqual(deleted.status, 200);
  });

  test('one user cannot read, edit or delete another user\'s note', async () => {
    const owner = await register('alice');
    const attacker = await register('bob');

    const created = await call('/api/notes/createnote', {
      method: 'POST',
      headers: { 'auth-token': owner.token },
      body: { title: 'Alice only', description: 'Confidential', tag: 'secret' },
    });
    assert.strictEqual(created.status, 200);
    const noteId = (await created.json())._id;

    // Bob's own list must not contain Alice's note.
    const bobList = await call('/api/notes/fetchnotes', {
      headers: { 'auth-token': attacker.token },
    });
    assert.strictEqual(bobList.status, 200);
    assert.deepStrictEqual(await bobList.json(), []);

    // Bob knows the id, and still must not be able to touch it.
    const edit = await call(`/api/notes/updatenote/${noteId}`, {
      method: 'PUT',
      headers: { 'auth-token': attacker.token },
      body: { title: 'Hijacked', description: 'Hijacked', tag: 'x' },
    });
    assert.ok(
      edit.status === 401 || edit.status === 403 || edit.status === 404,
      `cross-user edit should be refused, got ${edit.status}`
    );

    const del = await call(`/api/notes/deletenote/${noteId}`, {
      method: 'DELETE',
      headers: { 'auth-token': attacker.token },
    });
    assert.ok(
      del.status === 401 || del.status === 403 || del.status === 404,
      `cross-user delete should be refused, got ${del.status}`
    );

    // Alice's note must be untouched.
    const aliceList = await call('/api/notes/fetchnotes', {
      headers: { 'auth-token': owner.token },
    });
    const notes = await aliceList.json();
    assert.strictEqual(notes.length, 1);
    assert.strictEqual(notes[0].title, 'Alice only');
  });
});
