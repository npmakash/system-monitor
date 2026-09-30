import { App } from '../app/App';
import http from 'http';

describe('App Express Integration', () => {
  let appInstance: App;
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    appInstance = new App();
    server = appInstance.app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      done();
    });
  }, 15000);

  afterAll((done) => {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  }, 15000);

  test('GET /api/health returns 200 and status UP', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json.status).toBe('UP');
    expect(json.app).toBeDefined();
  }, 10000);

  test('GET /api/system/summary returns system metrics', async () => {
    const res = await fetch(`${baseUrl}/api/system/summary`);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cpu).toBeDefined();
    expect(json.data.memory).toBeDefined();
    expect(json.data.disks).toBeDefined();
  }, 10000);

  test('GET /api/processes returns process summary', async () => {
    const res = await fetch(`${baseUrl}/api/processes`);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.processes)).toBe(true);
  }, 10000);

  test('GET /api/cleaner/scan returns junk scan categories', async () => {
    const res = await fetch(`${baseUrl}/api/cleaner/scan`);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.categories)).toBe(true);
  }, 15000);
});
