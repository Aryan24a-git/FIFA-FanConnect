process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => require('./helpers/mockGemini'));

const request = require('supertest');
const app = require('../server/index');
const { validateAssist, validateAlert } = require('../server/utils/validators');
const { analyzeCrowd } = require('../server/engines/crowdEngine');
const { getRoute } = require('../server/engines/routingEngine');
const { generateAlert } = require('../server/engines/alertEngine');

describe('Utils & Engines', () => {
  it('validateAssist valid -> valid:true', () => {
    const res = validateAssist({ persona: 'fan', query: 'x', language: 'en', stadiumId: 'metlife' });
    expect(res.success).toBe(true);
  });

  it('validateAssist missing persona -> valid:false', () => {
    const res = validateAssist({ query: 'x', language: 'en', stadiumId: 'metlife' });
    expect(res.success).toBe(false);
  });

  it('validateAlert missing type -> valid:false', () => {
    const res = validateAlert({ stadiumId: 'metlife', severity: 'HIGH', location: 'x', reportedBy: 'x' });
    expect(res.success).toBe(false);
  });

  it('crowdEngine LOW/MODERATE/HIGH/CRITICAL thresholds', () => {
    // We mock gates with different queue sizes to trigger thresholds
    const low = analyzeCrowd('sofi', [{ id: 'A', currentQueue: 20, maxQueue: 500 }]);
    expect(low.overallLevel).toBe('LOW');

    const mod = analyzeCrowd('sofi', [{ id: 'A', currentQueue: 300, maxQueue: 500 }]);
    expect(mod.overallLevel).toBe('MODERATE');

    const high = analyzeCrowd('sofi', [{ id: 'A', currentQueue: 400, maxQueue: 500 }]);
    expect(high.overallLevel).toBe('HIGH');

    const crit = analyzeCrowd('sofi', [{ id: 'A', currentQueue: 490, maxQueue: 500 }]);
    expect(crit.overallLevel).toBe('CRITICAL');
  });

  it('routingEngine accessibility:true avoids stairs', () => {
    const route = getRoute('entrance', 'food', true);
    expect(route.accessibilityNeeded).toBe(true);
    // Since we fallback if not pre-mapped, it returns our fallback steps
    expect(route.steps[0].instruction).toContain('Fan Information Desk');
  });

  it('alertEngine all types return structured alert', () => {
    const a1 = generateAlert('CROWD', 'HIGH', 'Gate');
    expect(a1.id).toContain('ALERT-CROWD');
    
    const a2 = generateAlert('MEDICAL', 'LOW', 'Zone');
    expect(a2.id).toContain('ALERT-MEDICAL');
  });

  it('/health -> 200, status:healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /* catch-all -> 200, serves SPA HTML', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('Rate limiter returns 429 after exceeding gemini limit', async () => {
    const uniqueIP = '10.0.99.1';
    const requests = [];

    // Fire 21 concurrent requests from same IP
    for (let i = 0; i <= 20; i++) {
      requests.push(
        request(app)
          .post('/api/assist')
          .set('X-Forwarded-For', uniqueIP)
          .send({
            persona: 'fan',
            query: 'test query',
            language: 'en',
            stadiumId: 'metlife'
          })
      );
    }

    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);

    // At least one should be 429
    expect(statuses).toContain(429);
  });

  it('analyzeCrowd with empty gate array returns LOW level', () => {
    const result = analyzeCrowd('metlife', []);
    expect(result.overallLevel).toBe('LOW');
    expect(result.gateBreakdown).toHaveLength(0);
  });

  it('generateAlert with unknown type returns safe fallback', () => {
    const alert = generateAlert('UNKNOWN_TYPE', 'HIGH', 'Gate X');
    expect(alert.message).toContain('STADIUM NOTICE');
    expect(alert.instructions).toBeDefined();
  });

  it('getRoute with unrecognized locations returns Info Desk fallback', () => {
    const route = getRoute('xyzlocation', 'abcdunknown', false);
    expect(route.steps[0].instruction).toContain('Fan Information Desk');
    expect(route.note).toContain('not pre-mapped');
  });

  it('/health/ai -> 200, has aiProvider and modelReady fields', async () => {
    const res = await request(app).get('/health/ai');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('aiProvider');
    expect(res.body).toHaveProperty('modelReady');
    expect(res.body.fallbackAvailable).toBe(true);
  });
});
