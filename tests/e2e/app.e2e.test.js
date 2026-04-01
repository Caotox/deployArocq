/**
 * Tests E2E — ciblent un serveur en cours d'exécution
 * En CI : le serveur est démarré avant les tests (via le workflow)
 * En local : lancer `npm start` dans un autre terminal, puis `npm run test:e2e`
 */

const http = require('http');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      })
      .on('error', reject);
  });
}

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const url = new URL(`${BASE_URL}${path}`);
    options.hostname = url.hostname;
    options.port = url.port || 80;
    options.path = url.pathname;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── 1. Disponibilité de l'application ────────────────────────────────────────
describe('E2E — Disponibilité', () => {
  it('GET /health répond 200', async () => {
    const res = await get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── 2. Endpoint /api/items ────────────────────────────────────────────────────
describe('E2E — /api/items', () => {
  it('GET /api/items retourne une liste non vide', async () => {
    const res = await get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('POST /api/items crée un item', async () => {
    const res = await post('/api/items', { name: 'E2E Item' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('E2E Item');
  });

  it('POST /api/items sans name retourne 400', async () => {
    const res = await post('/api/items', {});
    expect(res.status).toBe(400);
  });
});

// ─── 3. Endpoint /api/hello/:name ─────────────────────────────────────────────
describe('E2E — /api/hello/:name', () => {
  it('GET /api/hello/World retourne le bon message', async () => {
    const res = await get('/api/hello/World');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Hello, World!');
  });
});
