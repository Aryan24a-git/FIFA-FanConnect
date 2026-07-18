process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => require('./helpers/mockGemini'));

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/transport', () => {
  it('should return ranked transport recommendations for a valid stadium', async () => {
    const res = await request(app)
      .post('/api/transport')
      .send({ stadiumId: 'sofi', destination: 'Airport' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recommendation.recommendations).toBeDefined();
    expect(res.body.recommendation.recommendations[0].mode).toBe('metro'); // SoFi Metro is highest efficiency
  });

  it('should lower Metro recommendation for AT&T Stadium', async () => {
    const res = await request(app)
      .post('/api/transport')
      .send({ stadiumId: 'atandt', destination: 'Downtown' });
    expect(res.status).toBe(200);
    const metro = res.body.recommendation.recommendations.find((r) => r.mode === 'metro');
    expect(metro.status).toBe('NOT_RECOMMENDED');
  });

  it('should trigger translation if language is not English', async () => {
    const res = await request(app)
      .post('/api/transport')
      .send({ stadiumId: 'sofi', destination: 'Downtown', language: 'fr' });
    expect(res.status).toBe(200);
    expect(res.body.translationSource).toBe('gemini');
  });

  it('should return 400 for missing destination', async () => {
    const res = await request(app).post('/api/transport').send({ stadiumId: 'metlife' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid stadiumId', async () => {
    const res = await request(app)
      .post('/api/transport')
      .send({ stadiumId: 'invalid-stadium', destination: 'Hotel' });
    expect(res.status).toBe(400);
  });
});
