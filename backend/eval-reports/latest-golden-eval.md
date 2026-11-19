# HyperResume Automated Golden Eval Report (Zero-Mock Regression Gate)
Timestamp: 2026-11-18T16:46:34.476Z

| # | Case | Before | After | Delta | Verb Div | Fab. Metrics | Strict JSON | Model | Latency | Status |
|---|------|--------|-------|-------|----------|--------------|-------------|-------|---------|--------|
| 1 | Junior Full-Stack Dev (Passive Verbs) | 72 | 72 | +0 | 100% | 0 | YES | gemini-3-flash-preview | 14181ms | PASS |
| 2 | Senior Backend (Repeated Verbs + Unbacked Skills) | 89 | 89 | +0 | 100% | 0 | YES | gemini-3.1-flash-lite | 11099ms | PASS |
| 3 | Frontend Engineer (Preserve Strong Metrics) | 83 | 83 | +0 | 100% | 0 | YES | gemini-3.1-flash-lite | 5076ms | PASS |
| 4 | ML Engineer (Academic Phrasing) | 76 | 76 | +0 | 100% | 0 | YES | gemini-flash-lite-latest | 10678ms | PASS |
| 5 | DevOps / SRE Engineer (Cloud Infra) | 90 | 90 | +0 | 100% | 0 | YES | gemini-3.1-flash-lite | 19382ms | PASS |
| 6 | B2B SaaS Product Manager (Non-Eng Domain) | 78 | 80 | +2 | 100% | 0 | YES | gemini-flash-lite-latest | 23526ms | PASS |
| 7 | Cybersecurity / AppSec Engineer | 67 | 67 | +0 | 100% | 0 | YES | gemini-flash-lite-latest | 17110ms | PASS |
| 8 | Mobile Engineer (Project-Heavy) | 81 | 81 | +0 | 100% | 0 | YES | gemini-flash-lite-latest | 11173ms | PASS |
| 9 | Engineering Manager (Org Metrics) | 87 | 91 | +4 | 100% | 0 | YES | gemini-3.1-flash-lite | 10075ms | PASS |
| 10 | SDET / QA Automation (JD Tailoring) | 68 | 68 | +0 | 100% | 0 | YES | gemini-flash-lite-latest | 4931ms | PASS |

## Aggregate Metrics & Regression Gates
- **Pass Rate:** 10/10 (100.0%) [gate >= 80%]
- **Avg ATS Score:** 79.1 -> 79.7 (**+0.6** avg delta) [gate >= +0.5]
- **Avg Action Verb Diversity:** 100.0% [gate >= 70%]
- **Silent Fabricated Metrics:** 0 [gate <= 0]
- **Strict responseSchema JSON Rate:** 100.0% [gate >= 100%]
- **Latency:** p50=11099ms, p95=23526ms, avg=12723ms [gate p95 <= 25000ms]
- **REGRESSION GATE VERDICT:** **PASS**