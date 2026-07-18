process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => require('./helpers/mockGemini'));

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/alert', () => {
  it('should handle CRITICAL crowd and return 200 with broadcastMessage', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({
        stadiumId: 'sofi',
        type: 'CROWD',
        severity: 'CRITICAL',
        location: 'Gate A',
        reportedBy: 'Staff',
      });
    expect(res.status).toBe(200);
    expect(res.body.alert.severity).toBe('CRITICAL');
    expect(res.body.broadcastMessage).toBeDefined();
  });

  it('should handle MEDICAL HIGH and return 200', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({
        stadiumId: 'metlife',
        type: 'MEDICAL',
        severity: 'HIGH',
        location: 'Zone B',
        reportedBy: 'Vol',
      });
    expect(res.status).toBe(200);
    expect(res.body.alert.severity).toBe('HIGH');
  });

  it('should return 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({
        stadiumId: 'sofi',
        type: 'INVALID_TYPE',
        severity: 'HIGH',
        location: 'Gate A',
        reportedBy: 'Staff',
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid severity', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({
        stadiumId: 'sofi',
        type: 'CROWD',
        severity: 'INVALID_SEV',
        location: 'Gate A',
        reportedBy: 'Staff',
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for missing stadiumId', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({ type: 'CROWD', severity: 'HIGH', location: 'Gate A', reportedBy: 'Staff' });
    expect(res.status).toBe(400);
  });
});
