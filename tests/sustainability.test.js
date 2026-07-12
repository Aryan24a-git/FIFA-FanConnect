process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => require('./helpers/mockGemini'));

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/sustainability', () => {
  it('should return eco recommendations for a valid stadium', async () => {
    const res = await request(app)
      .post('/api/sustainability')
      .send({ stadiumId: 'sofi' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recommendation.stadiumName).toContain('SoFi Stadium');
    expect(res.body.recommendation.waterStations).toBeDefined();
    expect(res.body.recommendation.ecoTip).toBeDefined();
  });

  it('should calculate carbon emissions when transportMode is provided', async () => {
    const res = await request(app)
      .post('/api/sustainability')
      .send({ stadiumId: 'metlife', transportMode: 'metro' });
    expect(res.status).toBe(200);
    expect(res.body.recommendation.carbonFootprintGrams).toBe(420); // 28 * 15
    expect(res.body.recommendation.comparison.length).toBeGreaterThan(0);
  });

  it('should trigger translation if language is not English', async () => {
    const res = await request(app)
      .post('/api/sustainability')
      .send({ stadiumId: 'metlife', language: 'es' });
    expect(res.status).toBe(200);
    expect(res.body.translationSource).toBe('gemini');
  });

  it('should return 400 for invalid stadiumId', async () => {
    const res = await request(app)
      .post('/api/sustainability')
      .send({ stadiumId: 'invalid-stadium' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid transportMode', async () => {
    const res = await request(app)
      .post('/api/sustainability')
      .send({ stadiumId: 'metlife', transportMode: 'hoverboard' });
    expect(res.status).toBe(400);
  });
});
