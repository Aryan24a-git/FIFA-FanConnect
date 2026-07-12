process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => require('./helpers/mockGemini'));

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/assist', () => {
  it('should handle fan persona successfully', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'fan', query: 'Where is food?', language: 'en', stadiumId: 'metlife' });
    expect(res.status).toBe(200);
    expect(res.body.persona).toBe('fan');
    expect(res.body.response).toBeDefined();
  });

  it('should handle volunteer persona successfully', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'volunteer', query: 'How to report issue?', language: 'en', stadiumId: 'sofi' });
    expect(res.status).toBe(200);
    expect(res.body.persona).toBe('volunteer');
  });

  it('should handle staff persona successfully', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'staff', query: 'Gate capacity?', language: 'en', stadiumId: 'atandt' });
    expect(res.status).toBe(200);
    expect(res.body.persona).toBe('staff');
  });

  it('should return 400 for missing persona', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ query: 'Hello', language: 'en', stadiumId: 'metlife' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid stadiumId', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'fan', query: 'Hello', language: 'en', stadiumId: 'invalid_stadium' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for query too long', async () => {
    const longQuery = 'a'.repeat(600);
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'fan', query: longQuery, language: 'en', stadiumId: 'metlife' });
    expect(res.status).toBe(400);
  });

  it('should handle Gemini failure using fallback FAQ and return 200', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'fan', query: 'xqz999zzz', language: 'en', stadiumId: 'metlife' });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('fallback');
  });

  it('should return 400 for unsupported language', async () => {
    const res = await request(app)
      .post('/api/assist')
      .send({ persona: 'fan', query: 'Hello', language: 'zz', stadiumId: 'metlife' });
    expect(res.status).toBe(400);
  });
});
