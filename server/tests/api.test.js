process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const token = jwt.sign({ id: '64b7f0f0f0f0f0f0f0f0f0f0' }, 'test-secret');

describe('Health & errors', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
  test('unknown route returns JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
  test('malformed JSON returns 400', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });
});

describe('Auth protection & validation', () => {
  test('tasks without token -> 401', async () => {
    expect((await request(app).get('/api/tasks')).status).toBe(401);
  });
  test('tasks with garbage token -> 401', async () => {
    expect((await request(app).get('/api/tasks').set('Authorization', 'Bearer abc')).status).toBe(401);
  });
  test('register with invalid data -> 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'bad', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });
  test('create task without title -> 400', async () => {
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
  test('invalid task id -> 400', async () => {
    const res = await request(app).get('/api/tasks/123').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('AI feature graceful errors', () => {
  test('requires auth', async () => {
    expect((await request(app).post('/api/ai/suggest').send({ goal: 'x' })).status).toBe(401);
  });
  test('missing API key -> 503 with friendly message', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await request(app).post('/api/ai/suggest').set('Authorization', `Bearer ${token}`).send({ goal: 'Launch my website' });
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/not configured/i);
  });
  test('short goal -> 400', async () => {
    const res = await request(app).post('/api/ai/suggest').set('Authorization', `Bearer ${token}`).send({ goal: 'a' });
    expect(res.status).toBe(400);
  });
});

describe('Notifier', () => {
  test('task events create notifications in background', async () => {
    const notifier = require('../src/events/notifier');
    notifier.emit('task:created', { user: 'u1', title: 'Demo' });
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));
    expect(notifier.getFor('u1')[0].message).toMatch(/Demo/);
  });
});
