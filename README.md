# 🏟️ FIFA FanConnect — Smart Stadium AI Assistant

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://stadium-saathi-run-env.a.run.app)
[![GitHub](https://img.shields.io/badge/github-FIFA--FanConnect-blue.svg)](https://github.com/Aryan24a-git/FIFA-FanConnect)
[![AI Provider](https://img.shields.io/badge/AI-Groq%20%7C%20Gemma%202-orange.svg)](https://console.groq.com/)

## 1. Problem Statement
The FIFA World Cup 2026 presents a massive logistical challenge across 16 US host cities, hosting 48 teams and welcoming over 1.5 million international fans. Managing crowd flow, answering high volumes of multilingual questions, directing stadium navigation, ensuring accessibility, and maintaining real-time safety coordination for fans, volunteers, and staff is critical.

**Chosen Vertical:** Smart Stadiums & Tournament Operations

---

## 2. Architecture Rationale
"FIFA FanConnect separates deterministic crowd analysis, routing, and alert logic from generative AI explanations. This architecture ensures reliable, hallucination-free operational decisions for safety-critical stadium scenarios while Gemini provides personalized, multilingual communication."

---

## 3. Architecture Flow Diagram

```text
Fan / Volunteer / Staff (Browser)
↓
Vanilla JS SPA (3 persona screens)
↓
Express API Routes (/api/assist, /api/alert, /api/navigate, /api/translate)
↓
Zod Validation Layer
↓
Deterministic Engines (crowdEngine → alertEngine → routingEngine)
↓
Gemini AI Service (explanation + translation ONLY — never decides)
↓
Fallback (faqDatabase + static alert messages if Gemini fails)
↓
JSON Response → Frontend
```

---

## 4. Target Personas

| Persona | Use Case | Screens & Routes Used |
| :--- | :--- | :--- |
| **Fan** | Needs real-time stadium navigation, crowd queue estimates, food concessions guidance, and multilingual FAQ answers. | Fan Tab, `/api/assist`, `/api/navigate`, `/api/translate` |
| **Volunteer** | Requires localized area briefings, shift details, and a quick incident report module. | Volunteer Tab, `/api/assist`, `/api/alert` |
| **Staff** | Needs central operational overview, gate utilization metrics, and emergency broadcast dispatch tools. | Staff Tab, `/api/alert`, `/api/assist` |

---

## 5. AI Integration
- **Provider:** [Groq](https://console.groq.com/) — accessed via the `GEMINI_API_KEY` environment variable set to a Groq API key (prefixed `gsk_`).
- **Model:** `gemma2-9b-it` (Google Gemma 2 9B Instruct, served through Groq's ultra-fast inference API)
- **AI Roles:**
  - Explains real-time crowd congestion scenarios to fans and volunteers in plain language.
  - Translates detailed routing directions into the fan's selected language.
  - Answers complex fan queries with contextual, conversational responses.
- **Fallback:** Gracefully cascades to [faqDatabase.js](file:///c:/projects/challange%204/stadium-saathi/server/data/faqDatabase.js) keyword searches or static English instructions if the Groq API is unavailable.
- **Multi-Provider Auto-Detection:** The `GEMINI_API_KEY` environment variable prefix drives provider selection automatically — `gsk_` routes to Groq, `sk-or-` routes to OpenRouter, and an `AIzaSy` prefix uses the Google Gemini SDK directly.

---

## 6. Security Measures
- **Helmet.js with Strict CSP:** Removed `'unsafe-inline'` and `'unsafe-eval'` from `scriptSrc` entirely. Inline scripts are fully extracted to [init.js](file:///c:/projects/challange%204/stadium-saathi/public/js/init.js).
- **DOMPurify:** Enforced client-side to sanitize all dynamic HTML injection points.
- **Zod Validation:** Strict types and bounds checking on all incoming API route payloads.
- **Two-Tier Rate Limiting:** Global endpoint limit of 100 requests per 15 minutes, with a stricter limit of 20 requests per minute on Gemini-backed paths.
- **CORS Lock:** Strictly origin-locked to prevent cross-site execution.
- **Non-Root Container:** Runs on `node:20-alpine` as a non-privileged `appuser`.
- **Secret Manager Integration:** Injects API keys securely in production without disk storage.
- **Timeout Protection:** 8-second absolute timeouts enforced on all outbound AI connection streams.

---

## 7. Testing Strategy
- **Frameworks:** Jest + Supertest.
- **Test Coverage:** Encompasses 35 tests across 5 test suites:
  - [alert.test.js](file:///c:/projects/challange%204/stadium-saathi/tests/alert.test.js) (API alert endpoints)
  - [assist.test.js](file:///c:/projects/challange%204/stadium-saathi/tests/assist.test.js) (API assistant/FAQ search routes)
  - [navigate.test.js](file:///c:/projects/challange%204/stadium-saathi/tests/navigate.test.js) (API navigation / step translation)
  - [translate.test.js](file:///c:/projects/challange%204/stadium-saathi/tests/translate.test.js) (API translation helper)
  - [utils.test.js](file:///c:/projects/challange%204/stadium-saathi/tests/utils.test.js) (Engines, validators, health routes, and rate-limiting)
- **Offline Reliability:** Fully mocked Gemini SDK to simulate normal operations and handle failure fallback behavior using distinct search strings (e.g. `xqz999zzz`).

---

## 8. Accessibility (a11y)
- **Language Code:** Declared `lang="en"` on the document root.
- **Keyboard Navigation:** Includes a skip-to-main link (`href="#main-content"`) at the top of the body.
- **ARIA Semantics:** Uses `role="log"` on alert feeds, `role="alert"` on message toast notifications, `role="navigation"` on the sidebar menu, and `aria-label` descriptors on input fields.
- **Touch Design:** Enforces 48px minimum touch dimensions for all screen buttons and controls.
- **Dynamic Updates:** Gate status and crowd indicators update `aria-label` attributes in real time.

---

## 9. Evaluation Criteria Coverage

| Criterion | Evidence | File |
| :--- | :--- | :--- |
| **Code Quality** | Comprehensive JSDocs, rigid ESLint config, structured Zod schemas, central variables, and unified custom errors. | [constants.js](file:///c:/projects/challange%204/stadium-saathi/server/utils/constants.js), [.eslintrc.json](file:///c:/projects/challange%204/stadium-saathi/.eslintrc.json) |
| **Security** | Hardened Helmet CSP headers, DOMPurify sanitization, Zod filters, API rate limiters, CORS locks, non-root Docker builds, and AI timeouts. | [index.js](file:///c:/projects/challange%204/stadium-saathi/server/index.js), [gemini.js](file:///c:/projects/challange%204/stadium-saathi/server/services/gemini.js), [Dockerfile](file:///c:/projects/challange%204/stadium-saathi/Dockerfile) |
| **Efficiency** | Gzip compression, minimal Alpine base image, `npm ci` production locks, and deterministic engines avoiding AI latency/costs. | [index.js](file:///c:/projects/challange%204/stadium-saathi/server/index.js), [Dockerfile](file:///c:/projects/challange%204/stadium-saathi/Dockerfile) |
| **Testing** | Supertest integration tests with 35 assertions, offline mocked AI, fallback tests, and rate limiting validation. | [tests/](file:///c:/projects/challange%204/stadium-saathi/tests) |
| **Accessibility** | ARIA markup, skip links, 48px touch sizes, document language attributes, and dynamic screen reader announcements. | [index.html](file:///c:/projects/challange%204/stadium-saathi/public/index.html), [app.js](file:///c:/projects/challange%204/stadium-saathi/public/js/app.js) |
| **Problem Alignment** | Multi-persona dashboard (Fan, Vol, Staff), real World Cup venues, 9-language translation support, accessible navigation, and safety alerts. | All routes, engines, and views |

---

## 10. Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file with your API key and `PORT=8080`. Three options are supported:
   - **Groq** (used in this project): `GEMINI_API_KEY=gsk_...` (get a free key at [console.groq.com](https://console.groq.com/))
   - **OpenRouter** (alternative): `GEMINI_API_KEY=sk-or-...`
   - **Google Gemini SDK** (alternative): `GEMINI_API_KEY=AIzaSy...`
4. Run `npm start`.
5. Access `http://localhost:8080` in your browser.

---

## 11. Production Deployment (Cloud Run)
This project is configured for continuous deployment to Google Cloud Run using Cloud Build (`cloudbuild.yaml`).
- Alpine base image for security and size reduction.
- Non-root `appuser`.
- Secrets injected via Google Cloud Secret Manager.

---

## 12. Assumptions
- Real-time turnstile data would be streamed to the backend (mocked in `stadiumData.js`).
- The application is served on a modern browser that supports ES6 and CSS Variables.
- Multilingual translations are requested primarily by fans, while operations are handled in standard locales.
