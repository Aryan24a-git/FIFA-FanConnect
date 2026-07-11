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
            return {
              response: { text: () => 'Hola' }
            };
          })
        })
      };
    })
  };
});

const request = require('supertest');
const app = require('../server/index');

describe('POST /api/translate', () => {
  it('should translate Hello to es -> 200', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Hello',
        targetLanguage: 'es'
      });
    expect(res.status).toBe(200);
    expect(res.body.original).toBe('Hello');
    expect(res.body.translated).toBe('Hola');
    expect(res.body.language).toBe('es');
    expect(res.body.source).toBe('gemini');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should bypass translation for targetLanguage: en -> 200 with source: passthrough', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Welcome',
        targetLanguage: 'en'
      });
    expect(res.status).toBe(200);
    expect(res.body.original).toBe('Welcome');
    expect(res.body.translated).toBe('Welcome');
    expect(res.body.language).toBe('en');
    expect(res.body.source).toBe('passthrough');
  });

  it('should return 400 for missing text', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        targetLanguage: 'es'
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for unsupported language xyz', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Hello',
        targetLanguage: 'xyz'
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 for text longer than 500 characters', async () => {
    const longText = 'a'.repeat(501);
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: longText,
        targetLanguage: 'es'
      });
    expect(res.status).toBe(400);
  });

  it('should handle Gemini failure gracefully -> 200 with fallback message', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'xqz999zzz',
        targetLanguage: 'es'
      });
    expect(res.status).toBe(200);
    expect(res.body.translated).toContain('Translation unavailable');
    expect(res.body.source).toBe('fallback');
  });
});
