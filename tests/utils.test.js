process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async () => {
            return { response: { text: () => 'Mocked Response' } };
          })
        })
      };
    })
  };
});

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

  it('Rate limiter triggers on 21st request with x-test-rate-limit header', async () => {
    // Send 20 requests to hit the limit
    for (let i = 0; i < 20; i++) {
      await request(app)
        .post('/api/assist')
        .set('X-Forwarded-For', '127.0.0.99')
        .send({ persona: 'fan', query: 'hello', language: 'en', stadiumId: 'metlife' });
    }
    
    // 21st request should be blocked
    const res = await request(app)
        .post('/api/assist')
        .set('X-Forwarded-For', '127.0.0.99')
        .send({ persona: 'fan', query: 'hello', language: 'en', stadiumId: 'metlife' });
        
    expect(res.status).toBe(429);
  });
});
