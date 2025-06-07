const fs = require('fs');
const path = require('path');
const os = require('os');
const startServer = require('../server');
const request = require('supertest');

let server;
let tmpDir;
let dataDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wallpapers-'));
  fs.writeFileSync(path.join(tmpDir, 'a.jpg'), 'dummy');
  fs.writeFileSync(path.join(tmpDir, 'b.png'), 'dummy');

  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
  process.env.XDG_DATA_HOME = dataDir;
  server = startServer({ port: 0, host: '127.0.0.1', staticDir: tmpDir });
});

afterAll(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('GET /backgrounds returns image list', async () => {
  const res = await request(server).get('/backgrounds');
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expect.arrayContaining(['a.jpg', 'b.png']));
});

test('settings roundtrip', async () => {
  const initial = await request(server).get('/settings');
  expect(initial.status).toBe(200);
  const newSettings = { ...initial.body };
  newSettings.timeFormat = 'H:m:s';
  newSettings.dateLang = 'ja-JP';
  newSettings.dateFormat = 'numericWeekday';
  const save = await request(server).post('/settings').send(newSettings);
  expect(save.status).toBe(200);
  expect(save.body).toEqual({ ok: true });
  const after = await request(server).get('/settings');
  expect(after.body.timeFormat).toBe(newSettings.timeFormat);
  expect(after.body.dateLang).toBe(newSettings.dateLang);
  expect(after.body.dateFormat).toBe(newSettings.dateFormat);
});
