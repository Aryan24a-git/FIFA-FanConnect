'use strict';

/**
 * Shared mock implementation for the Google Generative AI SDK in test suites.
 */
module.exports = {
  GoogleGenerativeAI: jest.fn().mockImplementation(() => {
    return {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockImplementation(async (prompt) => {
          const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
          if (promptStr.includes('xqz999zzz')) {
            throw new Error('Mock Gemini failure');
          }
          if (promptStr.includes('translate') || promptStr.includes('translation')) {
            return {
              response: { text: () => 'Hola' }
            };
          }
          if (promptStr.includes('route') || promptStr.includes('navigate') || promptStr.includes('wayfinding') || promptStr.includes('path')) {
            return {
              response: {
                text: () => 'Step 1: Ingrese por la puerta asignada y escanee su boleto.\nStep 2: Siga los letreros de la zona de color.'
              }
            };
          }
          if (promptStr.includes('broadcast') || promptStr.includes('PA') || promptStr.includes('broadcastMessage')) {
            return {
              response: { text: () => 'Mocked AI PA Broadcast Message' }
            };
          }
          return {
            response: { text: () => 'Mocked AI Response' }
          };
        })
      })
    };
  })
};
