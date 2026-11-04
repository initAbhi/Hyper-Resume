# HyperResume AI Mock Interview Preparation Studio
## Complete Architectural, Technical & Operational Specification

> **Version**: 1.0 (Production Ready)  
> **Target Audience**: AI Agents, Backend/Frontend Engineers, Product Managers  
> **Last Updated**: November 2026

---

## 1. Executive Summary & Product Positioning

**HyperResume AI Mock Interview Studio** is a core premium feature designed to elevate HyperResume from a resume document editor into an end-to-end career acceleration engine.

Unlike standalone, disconnected interview preparation apps that ask generic leetcode or theoretical questions, HyperResume's Interview Studio is **deeply grounded in the candidate's actual resume** and **optionally matched to target job descriptions (JDs)**.

### Primary Business & Product Objectives:
1. **Increase Free-to-Paid Conversion**: Give free users a tangible taste of AI interview readiness (1 Quick Practice session) and unlock staff-level model answers, adaptive follow-ups, and full mock simulations upon purchasing credit packs.
2. **Drive Credit Pack Velocity**: Reuses the existing credit ledger system to monetize interviews without introducing complicated recurring subscription billing.
3. **Prevent Token & Financial Bleed**: Enforces stage-specific `maxOutputTokens`, compact ~500-token resume dossiers, strict prompt-injection sanitation, and atomic credit refund guarantees on inference failure.
4. **Zero Heavy Infrastructure**: No WebSockets, Redis, BullMQ, video streaming, or isolated sandbox execution containers required in MVP. Built on top of clean HTTP REST, PostgreSQL state transitions, and standard browser Web Speech APIs.

---

## 2. Interview Modes & Credit Ledger Structure

HyperResume uses an internal **credit ledger** (`credit_ledger` table). Users purchase one-time credit packs (e.g., Job Hunt Pack: 30 credits for ₹399, Job Hunt Pro: 100 credits for ₹899), while newly registered users receive 5 signup bonus credits.

| Mode | Credit Cost | Description | Question Count | Follow-Ups | Target Audience |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **Quick Practice** | **2 Credits** | Targeted warm-up confidence builder. Focuses on resume-grounded highlights without prolonged follow-up probing. | 3 | None | Free-trial users (exactly 1 trial) & paid users |
| **Full Mock Interview** | **5 Credits** | Complete realistic interview simulation. Covers behavioral STAR questions, system architecture, role-specific depth, and adaptive interviewer follow-ups. | 5 | Yes (Adaptive) | Paid credit-pack customers only |
| **Weak Area Drill** | **3 Credits** | Re-tests competencies and question categories where the user previously scored low in prior sessions. | 3 | Optional | Paid credit-pack customers only |

### Free vs. Paid Entitlement Rules:
- **Free Users**:
  - Initial balance: 5 signup credits.
  - Allowed **exactly 1 Quick Practice interview trial** (2 credits charged, persistent flag `is_free_trial = true`).
  - Blocked server-side from starting Full Mock or Weak Area Drill modes (`403 Forbidden`).
  - Scorecard Report provides complete scoring and feedback, but **Personalized Model Answers are locked** starting from Question 2 onwards (Question 1 model answer is visible as a high-value teaser).
- **Paid Credit-Pack Customers**:
  - Defined as users who have completed at least one successful credit pack purchase transaction (`orders` table).
  - Can initiate all modes (Quick, Full Mock, Weak Area) as long as available credit balance is sufficient.
  - Full access to all staff-level personalized model answers for all questions.
  - Lifetime access to historical interview scorecards even if credit balance reaches zero.

---

## 3. Database Architecture & Schema

All interview state is persisted in PostgreSQL via TypeORM entities registered in `backend/src/database/entities.ts` and managed by migration `1728864000002-CreateInterviewEntities.ts`.

```
                    ┌───────────────────────────┐
                    │           users           │
                    └─────────────┬─────────────┘
                                  │ 1:N
                                  ▼
                    ┌───────────────────────────┐
                    │    interview_sessions     │
                    └───────┬───────────┬───────┘
                            │ 1:N       │ 1:N
                            ▼           ▼
        ┌───────────────────────┐   ┌───────────────────────┐
        │  interview_questions  │   │    interview_turns    │
        └───────────────────────┘   └───────────────────────┘
```

### 3.1. `interview_sessions` Table
Tracks session metadata, difficulty, status, cost telemetry, and final readiness scores.

```sql
CREATE TABLE "interview_sessions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
  "job_description_id" UUID REFERENCES "job_descriptions"("id") ON DELETE SET NULL,
  "session_mode" VARCHAR(32) NOT NULL, -- 'quick_practice' | 'full_mock' | 'weak_area'
  "target_role" VARCHAR(255) NOT NULL,
  "difficulty" VARCHAR(32) NOT NULL DEFAULT 'mid', -- 'junior' | 'mid' | 'senior' | 'lead'
  "status" VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'abandoned' | 'failed'
  "is_free_trial" BOOLEAN NOT NULL DEFAULT false,
  "credits_charged" INT NOT NULL DEFAULT 0,
  "total_questions" INT NOT NULL DEFAULT 3,
  "current_question_index" INT NOT NULL DEFAULT 0,
  "overall_score" INT,
  "sub_scores" JSONB, -- { technicalDepth: 85, clarityCommunication: 80, structuredThinking: 82, relevanceRole: 88 }
  "token_usage" JSONB, -- { promptTokens: 4200, candidateTokens: 1800, totalTokens: 6000 }
  "gemini_cost_usd" NUMERIC(10, 6) DEFAULT 0,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial Unique Index strictly enforcing one free trial per user:
CREATE UNIQUE INDEX "idx_one_free_trial_per_user" 
ON "interview_sessions" ("user_id") 
WHERE is_free_trial = true;
```

### 3.2. `interview_questions` Table
Stores generated questions and grading criteria for the session.

```sql
CREATE TABLE "interview_questions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "session_id" UUID NOT NULL REFERENCES "interview_sessions"("id") ON DELETE CASCADE,
  "order_index" INT NOT NULL,
  "category" VARCHAR(64) NOT NULL, -- 'behavioral' | 'architecture' | 'technical_deep_dive' | 'problem_solving' | 'role_fit'
  "question_text" TEXT NOT NULL,
  "context_hint" VARCHAR(255),
  "evaluation_rubric" JSONB, -- key points and expected technical terms
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.3. `interview_turns` Table
Stores the user's answers, audio metadata, AI evaluation, adaptive follow-up, and follow-up answer.

```sql
CREATE TABLE "interview_turns" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "session_id" UUID NOT NULL REFERENCES "interview_sessions"("id") ON DELETE CASCADE,
  "question_id" UUID NOT NULL REFERENCES "interview_questions"("id") ON DELETE CASCADE,
  "candidate_answer" TEXT NOT NULL,
  "turn_score" INT,
  "status" VARCHAR(32) NOT NULL DEFAULT 'evaluating', -- 'evaluating' | 'evaluated' | 'failed'
  "evaluation" JSONB, -- { score, strengths: [], improvementTip, idealAnswerDraft, starPresent: { situation, task, action, result } }
  "follow_up_question" TEXT,
  "follow_up_answer" TEXT,
  "follow_up_score" INT,
  "time_taken_seconds" INT DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.4. `credit_ledger` Transaction Type
Added `'mock_interview'` to `CreditTransactionType` enum in `backend/src/credits/entities/credit-ledger.entity.ts`.

---

## 4. AI Inference Layer & Cost Control

The AI engine lives in [`GeminiInterviewProvider`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/ai/providers/gemini-interview.provider.ts) (`backend/src/ai/providers/gemini-interview.provider.ts`).

### 4.1. Stage-Specific Output Token Budgets (`maxOutputTokens`)
Uncapped generation leads to unpredictable billing. Each stage has strict token caps:

| Stage | Method | `maxOutputTokens` | Rationale |
| :--- | :--- | :---: | :--- |
| **Quick Practice Questions** | `generateQuickQuestions` | **600** | 3 structured questions with category hints |
| **Full Mock Questions** | `generateMockQuestions` | **1,000** | 5 detailed technical & behavioral scenarios |
| **Turn Evaluation** | `evaluateAnswerTurn` | **450** | STAR breakdown, strengths, and coaching tip |
| **Adaptive Follow-Up** | `generateFollowUpQuestion` | **400** | Deep probe targeted at candidate's answer gaps |
| **Readiness Scorecard** | `compileReadinessReport` | **800** | 4 sub-scores, synthesis, and key takeaways |

### 4.2. Compact Context Dossier Extraction
To prevent massive prompts, [`ContextDossierBuilder`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/ai/utils/context-dossier-builder.ts) truncates and extracts a compact summary (~500 tokens) from the candidate's resume and job description:
- Top 8 technical skills.
- 2 most recent job titles and company names.
- 3 representative achievement bullets.
- Target role and core requirements from the job description.

### 4.3. Prompt Injection Defense
User answers and resumes are untrusted content. [`PromptSanitizer`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/ai/utils/prompt-sanitizer.ts) protects against LLM jailbreaks:
- Enforces a 1,500-character upper bound per answer.
- Neutralizes prompt escape tokens (`system:`, `human:`, `assistant:`, `ignore previous instructions`, `bypass rules`).
- Neutralizes markdown/XML fences (`<<<`, `>>>`, ````).
- **Preserves programming constructs**: explicitly retains valid syntax such as generic types `<T>`, `<string>`, arrow functions `=>`, and logical operators `&&`, `||`.

---

## 5. Backend Service Architecture & Fault Tolerance

Located in [`InterviewsService`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/interviews/interviews.service.ts).

### 5.1. Transactional Atomicity
Deducting credits and creating the session occurs in a single TypeORM transaction manager:
```typescript
await this.dataSource.transaction(async (manager) => {
  // 1. Deduct credits using manager
  await this.creditsService.deductCredits(userId, requiredCredits, 'Mock interview session', manager);
  // 2. Persist session entity
  session = await manager.save(InterviewSession, newSession);
});
```

### 5.2. Atomic Failure Refund Guarantee
If Gemini times out or fails during question generation, the system rolls back credits atomically:
```typescript
private async refundFailedSession(sessionId: string, userId: string, credits: number) {
  await this.dataSource.transaction(async (manager) => {
    await manager.update(InterviewSession, { id: sessionId }, { status: 'failed' });
    await this.creditsService.refundCredits(userId, credits, 'AI Provider timeout during interview creation', manager);
  });
}
```

### 5.3. Stale Processing State Recovery
When a user submits an answer, the turn enters the `'evaluating'` state. If the browser disconnects or the server is interrupted:
- `recoverStaleTurnEvaluations()` checks for turns in `'evaluating'` older than **30,000 ms (30 seconds)**.
- Reverts them to `'failed'` or resets the state, allowing safe user resubmission.

### 5.4. Concurrency & Idempotency
- Reads `idempotency-key` / `Idempotency-Key` from request headers.
- Prevents concurrent double-billing or duplicate question generation when users click buttons rapidly.

---

## 6. API Reference (`/api/v1/interviews`)

All routes require a valid JWT Bearer Token (`JwtAuthGuard`).

### 6.1. `POST /api/v1/interviews/start`
Starts a new interview session, charges credits, and generates questions.
- **Headers**: `idempotency-key: <uuid>` (optional but recommended)
- **Body**:
  ```json
  {
    "resumeId": "uuid",
    "jobDescriptionId": "uuid (optional)",
    "sessionMode": "quick_practice", // "quick_practice" | "full_mock" | "weak_area"
    "targetRole": "Full Stack Developer",
    "difficulty": "mid" // "junior" | "mid" | "senior" | "lead"
  }
  ```
- **Response**: `201 Created` with session and the first active question.

### 6.2. `GET /api/v1/interviews/:id`
Retrieves session progress, questions, and active turn.

### 6.3. `POST /api/v1/interviews/:id/answer`
Submits an answer for the current question.
- **Body**:
  ```json
  {
    "questionId": "uuid",
    "candidateAnswer": "I architected the checkout microservice using NestJS and Redis...",
    "timeTakenSeconds": 48
  }
  ```
- **Response**: `200 OK` with evaluation score, STAR check, strengths, coaching tip, model answer, and adaptive follow-up (if applicable).

### 6.4. `POST /api/v1/interviews/:id/follow-up`
Submits an answer to the interviewer's adaptive follow-up probe.
- **Body**:
  ```json
  {
    "questionId": "uuid",
    "followUpAnswer": "To handle distributed cache invalidation, we used Redis pub/sub..."
  }
  ```

### 6.5. `POST /api/v1/interviews/:id/finish`
Concludes the interview, calculates aggregate sub-scores, and transitions status to `'completed'`.

### 6.6. `GET /api/v1/interviews/:id/report`
Fetches the readiness scorecard.
- If user is free-tier: `idealAnswerDraft` is redacted for Question 2 onwards.
- If user is paid credit-pack customer: returns full staff-level model answers.

### 6.7. `GET /api/v1/interviews`
Lists past interview sessions for the logged-in user.

---

## 7. Frontend Architecture & User Experience

Frontend pages reside under `frontend/app/app/interview/`:

### 7.1. Studio Hub (`/app/interview/page.tsx`)
- Mode picker (Quick Practice, Full Mock, Weak Area Drill).
- Resume and target Job Description dropdown selector.
- Seniority & difficulty configuration.
- Real-time credit cost calculation vs. available balance.
- History list of past sessions with score indicators and direct report links.

### 7.2. Active Interview Simulator (`/app/interview/[sessionId]/page.tsx`)
- Clean distraction-free interface with progress bar and stopwatch timer.
- Category badge and contextual hint.
- STAR framework answer editor with character counter (max 1,500 chars).
- **Speech-to-Text Dictation**: Uses native Web Speech API (`webkitSpeechRecognition`) for hands-free voice practice with real-time transcription.
- Instant micro-feedback card displaying:
  - Turn Score (0-100) & Status badge.
  - STAR completeness badges (S, T, A, R).
  - Key Strengths bullet points.
  - Specific coaching recommendations.
  - Adaptive Follow-Up question probe.

### 7.3. Readiness Scorecard Report (`/app/interview/[sessionId]/report/page.tsx`)
- Overall readiness score out of 100 with tiered rating (`Interview Ready`, `Solid Potential`, `Needs Practice`).
- 4 Competency Sub-Scores with progress meters:
  - Technical Depth & Correctness
  - Clarity & Communication
  - Structured Thinking (STAR Method)
  - Role Relevance & Contextual Fit
- Key takeaway panel for strengths and areas for improvement.
- Full turn-by-turn question review with user answers, follow-up answers, and feedback.
- **Pro Model Answer Upsell Lock**: Free users see Question 1's model answer and an upgrade card for questions 2+, directing them to credit recharge.
- Printable view optimized via Tailwind `print:` directives.

---

## 8. Authentication & CORS Configuration

### 8.1. JWT Expiry & Refresh Behavior
- Access token lifespan is set to **7 days** (`JWT_ACCESS_EXPIRES_IN=7d`).
- Refresh token lasts **30 days**.
- In [`ApiClient`](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/api-client.ts), a silent 401 interceptor automatically calls `/api/v1/auth/refresh` in the background and replays pending requests so users are never logged out while practicing.

### 8.2. CORS Allowed Headers
In [`backend/src/main.ts`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/main.ts), CORS preflight explicitly allows:
- `idempotency-key`
- `Idempotency-Key`
- `x-request-id`
- `X-Request-ID`
- `Content-Type`
- `Authorization`

---

## 9. Verification & Automated Testing

All features are covered by automated test suites:
- **Backend Tests**: `bun --cwd backend test`
  - [`interviews.service.spec.ts`](file:///c:/Users/addme/Desktop/Hyper-Resume/backend/src/interviews/interviews.service.spec.ts): 9 dedicated unit tests covering start flow, free-trial index restrictions, atomic refunds on AI failure, and stale turn recovery.
  - Full suite: **77/77 tests passing**.
- **Frontend Tests**: `bun --cwd frontend test`
  - [`interview.test.ts`](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/interview.test.ts): Unit tests for API client serialization, idempotency headers, turn answering, and report gating.
  - [`api-client.test.ts`](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/api-client.test.ts): Unit test verifying silent token refresh on 401.
  - Full suite: **42/42 tests passing**.
- **TypeScript**: `tsc --noEmit` compiles with **0 errors** across both frontend and backend.

