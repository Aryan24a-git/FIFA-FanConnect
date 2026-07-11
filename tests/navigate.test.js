process.env.GEMINI_API_KEY = 'test-key-for-jest';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async (prompt) => {
            let promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
            if (promptStr.includes('xqz999zzz')) {
              throw new Error('Mock Gemini failure');
            }
            // Mock a translated output.
            // Split line parser in navigate.js expects:
            // "Step 1: instruction\nStep 2: instruction"
            return {
              response: {
                text: () => 'Step 1: Ingrese por la puerta asignada y escanee su boleto.\nStep 2: Siga los letreros de la zona de color.'
              }
            };
          })
        })
      };
    })
  };
});

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/navigate', () => {
  it('should handle a valid navigation request (metlife, from:entrance, to:food, accessibility:false, language:en) -> 200', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        from: 'entrance',
        to: 'food',
        accessibility: false,
        language: 'en'
      });
    expect(res.status).toBe(200);
    expect(res.body.steps).toBeDefined();
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.steps.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('estimatedMinutes');
    expect(res.body).toHaveProperty('estimatedTime');
    expect(res.body.accessibility).toBe(false);
    expect(res.body.from).toBe('entrance');
    expect(res.body.to).toBe('food');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should handle accessibility:true -> 200, note contains elevator or accessible', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        from: 'entrance',
        to: 'seat',
        accessibility: true,
        language: 'en'
      });
    expect(res.status).toBe(200);
    expect(res.body.accessibility).toBe(true);
    expect(res.body.note.toLowerCase()).toMatch(/elevator|accessible/);
  });

  it('should return 400 for invalid stadiumId', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'invalid-stadium',
        from: 'entrance',
        to: 'food',
        accessibility: false,
        language: 'en'
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for missing from', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        to: 'food',
        accessibility: false,
        language: 'en'
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for missing to', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        from: 'entrance',
        accessibility: false,
        language: 'en'
      });
    expect(res.status).toBe(400);
  });

  it('should handle language:es -> 200, translationSource is gemini', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        from: 'entrance',
        to: 'seat',
        accessibility: false,
        language: 'es'
      });
    expect(res.status).toBe(200);
    expect(res.body.translationSource).toBe('gemini');
    expect(res.body.language).toBe('es');
  });

  it('should handle from and to both entrance (same normalized) -> 200', async () => {
    const res = await request(app)
      .post('/api/navigate')
      .send({
        stadiumId: 'metlife',
        from: 'entrance',
        to: 'entrance',
        accessibility: false,
        language: 'en'
      });
    expect(res.status).toBe(200);
    expect(res.body.from).toBe('entrance');
    expect(res.body.to).toBe('entrance');
  });
});
