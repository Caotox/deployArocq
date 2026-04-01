const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('retourne 200 avec status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('GET /api/items', () => {
  it('retourne un tableau de 3 items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(3);
  });

  it('chaque item a un id et un name', async () => {
    const res = await request(app).get('/api/items');
    res.body.items.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
    });
  });
});

describe('POST /api/items', () => {
  it('crée un item avec un name valide', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Item');
    expect(res.body).toHaveProperty('id');
  });

  it('retourne 400 si name est absent', async () => {
    const res = await request(app).post('/api/items').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('name is required');
  });
});

describe('GET /api/hello/:name', () => {
  it('retourne un message de salutation', async () => {
    const res = await request(app).get('/api/hello/Alice');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello, Alice!');
  });
});
