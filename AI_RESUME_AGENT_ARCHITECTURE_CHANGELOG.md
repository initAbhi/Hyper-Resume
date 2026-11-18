# HyperResume — Agentic AI Career Assistant Architecture Changelog
## Security and Architecture Consistency Revision (Revision 2.0)

**Document Version:** 2.0.0  
**Date:** November 17, 2026  
**Auditor Roles:** Principal AI Architect, Distributed Systems Engineer, Senior NestJS Engineer, Security Architect, QA Lead  
**Scope:** Architecture Package Harmonization across all 5 Specifications  

---

## 1. Executive Summary of Revision 2.0

Following a comprehensive security, concurrency, and architecture consistency review of Revision 1.0, all five core architecture documents have been updated to Revision 2.0:
1. `AI_RESUME_AGENT_ARCHITECTURE.md` (Rev 2.0)
2. `AI_RESUME_AGENT_TOOL_CATALOG.md` (Rev 2.0)
3. `AI_RESUME_AGENT_SECURITY_MODEL.md` (Rev 2.0)
4. `AI_RESUME_AGENT_TEST_STRATEGY.md` (Rev 2.0)
5. `AI_RESUME_AGENT_IMPLEMENTATION_ROADMAP.md` (Rev 2.0)

This revision resolves 11 architectural vulnerabilities, ambiguities, and edge cases, ensuring 100% mathematical and contract agreement across database entities, task states, tool names, credit reservations, and approval lifecycles.

---

## 2. Comprehensive Before vs. After Architecture Comparison

| Area | Revision 1.0 (Initial Draft) | Revision 2.0 (Security & Consistency Revision) | Architectural Rationale & Justification | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SSE Authentication** | Browser `EventSource` with query string token (`?token=jwt`). | **Short-Lived Signed Ticket Exchange (`POST /stream-ticket` -> `GET /stream?ticket=hash`).** | Standard browser `EventSource` does not support custom `Authorization: Bearer` headers. Putting raw JWTs in query parameters exposes credentials in web server logs, proxy caches, and browser history. Single-use ticket burns upon connection establishment. | `[APPROVED]` |
| **SSE Replay & Live Race** | Naive sequence query after client connection. | **Buffered Subscription Lock (Listen -> Buffer -> Fetch Replay -> Deduplicate -> Live Dispatch).** | Prevents race condition where live events firing between historical query and live listener attachment are either dropped or received out of order. | `[APPROVED]` |
| **Multi-Instance Scaling** | Single-node in-memory event dispatch. | **PostgreSQL `LISTEN / NOTIFY` (`pg_notify('agent_events_' || id, payload)`).** | Enables seamless cross-process broadcasting across multiple PM2 workers or Kubernetes pods without requiring Redis or extra infrastructure. | `[APPROVED]` |
| **Durable Worker Leases** | Row leasing via `FOR UPDATE SKIP LOCKED` and timestamp heartbeat. | **Monotonic Lease Fencing Tokens (`fence_token = fence_token + 1`).** | Martin Kleppmann's fencing token model prevents zombie workers (recovering from long GC pauses or network partitions) from committing split-brain writes after a lease has expired. | `[APPROVED]` |
| **Stale Lease Recovery Query** | Re-leased any task where `heartbeat_at < NOW() - 60s`. | **Explicitly Excludes `AWAITING_APPROVAL` Tasks.** | Tasks awaiting human approval are naturally silent while the user reviews the diff. Re-leasing them would erroneously mark them crashed and abort the user's review. | `[APPROVED]` |
| **Approval Security & Integrity** | Generic user approval by execution ID. | **Cryptographic Proposal Hash (`proposalHash = SHA256(diff)`), Expected Resume Version Check, Single-Use Burn, 15-Minute Expiry.** | Prevents proposal tampering, re-applying stale diffs after manual canvas edits, or applying altered client payloads. Server applies strictly the exact server-persisted diff. | `[APPROVED]` |
| **Credit Accounting** | Direct deduction before/during tool execution with refund on error. | **Two-Phase Credit Reservation Lifecycle (`RESERVED` -> `COMMITTED` / `RELEASED`).** | Pre-allocates balance before LLM call; prevents parallel tasks from concurrently overspending user credits; auto-releases on AI failure or unapproved timeout. | `[APPROVED]` |
| **Permission Matrix** | Ambiguity: `save_job_to_tracker` was `STATE_MUTATING` with "Approval: No". | **Clean 4-Tier Matrix: `READ_ONLY`, `AI_ANALYSIS`, `SAFE_MUTATING`, `STATE_MUTATING`.** | Segregates safe additive/non-destructive operations (`SAFE_MUTATING`: `save_job_to_tracker`, `create_resume`) from destructive overwrites (`STATE_MUTATING`: `apply_approved_edits`, `restore_resume_version`). | `[APPROVED]` |
| **Prompt Injection Defense** | Relied primarily on `PromptSanitizer` regex and XML tag delimiters. | **Multi-Layer Defense: Backend State Whitelisting (`apply_approved_edits` unexposed to Gemini) + XML Delimiters + Strict Whitelists.** | Regex and XML tags can be bypassed by advanced adversarial prompt injections. Absolute security is achieved by ensuring destructive tools cannot be called by LLM function declarations under any circumstances. | `[APPROVED]` |
| **Career Vault Memory** | Default opt-in (`ai_memory_consent = true`); AI verified candidate skills. | **Explicit Opt-In (`ai_memory_consent = false` default) + Segregation of `detected_skills` vs `verified_skills`.** | Conforms to strict GDPR/privacy governance. The AI is strictly forbidden from independently promoting detected skills to verified status. Only human candidates confirm skills. | `[APPROVED]` |
| **Tool Catalog Synchronization** | 15 tools in Catalog with slight path and schema discrepancies in Roadmap. | **100% Synchronized Tool Definitions, File Paths, Schemas & Costs.** | Every tool in the Catalog maps directly to an explicit file in `backend/src/agent/tools/definitions/*.tool.ts` and in the Roadmap Phase 1 file list. | `[APPROVED]` |
| **Factual Integrity & Provenance** | Flagged hallucinations after generation. | **Mandatory Evidence Provenance (`evidenceProvenance` object with source bullet citations & confirmation prompts).** | Rewritten bullets must cite the exact source bullet index and quote. Added metrics must be explicitly confirmed via candidate checkboxes in the UI. | `[APPROVED]` |
| **Frontend Streaming UX** | Streamed raw chain-of-thought and internal LLM thoughts. | **User-Facing Execution Progress, Visual Step Checklists & Concise Summaries.** | Internal system prompts and chain-of-thought are hidden from users, providing a professional, clean UX while preventing prompt leak. | `[APPROVED]` |
| **Test Strategy & Fixtures** | Generic test descriptions; unspecified candidate data. | **Dedicated Security Suites (Fencing, Replay, Collisions) + Strictly Synthetic Fixtures (Zero Real PII).** | Explicit acceptance scenarios with exact database state transitions and test fixtures with synthetic data (Alex Sharma). | `[APPROVED]` |

---

## 3. Detailed Resolution of the 11 Mandatory Findings

### 3.1 Finding 1: SSE Authentication, Replay Race & Multi-Instance Scaling
- **Problem:** Native browser `EventSource` cannot send `Authorization: Bearer <jwt>`. Putting JWTs in URLs is insecure. Replay vs. live events can cause race condition duplicates. Multi-node clusters cannot broadcast events without Redis.
- **Resolution:**
  1. Implemented **Stream Ticket Exchange**: Client makes authenticated `POST /agent/conversations/:id/stream-ticket`, receiving a high-entropy 30-second single-use ticket. The ticket is validated and burned upon SSE connection establishment.
  2. Implemented **Connection Buffer Lock**: Upon connection, the server registers a PostgreSQL `LISTEN` channel, buffers incoming live events in memory, queries missing events `WHERE seq > lastEventId`, streams historical events, flushes buffered events with `seq > maxHistorical`, and transitions to live dispatch.
  3. Implemented **PostgreSQL `pg_notify`**: When a worker on any cluster node records an event in `agent_task_events`, PostgreSQL broadcasts the notification. All NestJS/PM2 instances receive it and route it to their connected client socket. Zero Redis required.

### 3.2 Finding 2: Durable Worker Leasing, Fencing Tokens & Stale Exclusion
- **Problem:** Paused workers can wake up and commit stale writes (split-brain). Tasks awaiting approval could be mistaken for crashed tasks and re-leased.
- **Resolution:**
  1. Implemented **Monotonic Lease Fencing Tokens**: Every task has a `fence_token` counter. Re-leasing increments `fence_token`. Every database mutation asserts `WHERE id = :taskId AND fence_token = :currentFence`. Stale workers receive 0 affected rows and abort immediately.
  2. Implemented **`AWAITING_APPROVAL` Exclusion**: The worker lease query strictly queries:
     ```sql
     WHERE status = 'PENDING'
        OR (status IN ('PLANNING', 'RUNNING') AND heartbeat_at < NOW() - INTERVAL '60 seconds')
     ```
     Tasks in `AWAITING_APPROVAL` are excluded, allowing the human user unlimited time to review diffs.

### 3.3 Finding 3: Cryptographic Approval Security & Proposal Binding
- **Problem:** A client could replay an old approval, tamper with the diff payload, or approve a proposal after someone edited the resume on the canvas.
- **Resolution:**
  1. Staged proposals compute `proposalHash = SHA-256(canonicalJson(diff))`.
  2. Record stores `user_id`, `task_id`, `resume_id`, `expected_resume_version`, `expires_at = NOW() + 15m`, and `is_consumed = false`.
  3. Approval endpoint verifies: (a) caller owns record, (b) hash matches, (c) not expired, (d) not consumed, (e) `live_resume.version === expected_resume_version`.
  4. Server commits ONLY the server-persisted diff payload.

### 3.4 Finding 4: Atomic Two-Phase Credit Reservations
- **Problem:** Concurrent agent tasks could run simultaneously and overdraft a user's credit balance before deductions land.
- **Resolution:**
  1. Implemented **Two-Phase Reservation Lifecycle**:
     - `reserveCredits`: Calculates $\text{Available} = \sum \text{Committed} - \sum \text{Active Reservations}$. If balance $< \text{Cost}$ and no Pro Pass, halts with `AWAITING_CREDITS`. Creates ledger row with `status = 'RESERVED'`.
     - `commitReservation`: Updates status to `COMMITTED` upon successful AI generation and validation.
     - `releaseReservation`: Updates status to `RELEASED` on AI failure, timeout, or user rejection.
  2. Added configurable spending cap (`MAX_TASK_CREDIT_SPEND = 6` credits default).

### 3.5 Finding 5: Permission Matrix & Elimination of Contradictions
- **Problem:** `save_job_to_tracker` was previously labeled `STATE_MUTATING` with "Approval: No", creating an architectural contradiction.
- **Resolution:**
  - Introduced `SAFE_MUTATING` for additive, non-destructive actions that create new isolated records (`save_job_to_tracker`, `create_resume`).
  - Restricted `STATE_MUTATING` strictly to operations that modify, overwrite, or roll back core user documents (`apply_approved_edits`, `restore_resume_version`, `update_career_profile`).
  - Enforced that 100% of `STATE_MUTATING` tools require mandatory cryptographic human approval.

### 3.6 Finding 6: Multi-Layer Prompt Injection Defense
- **Problem:** Relying only on XML tags and regexes is vulnerable to adversarial jailbreaks.
- **Resolution:**
  - Implemented **Backend State Whitelisting**: The agent cannot call tools that are not whitelisted for the current task state.
  - **`apply_approved_edits` is completely unexposed to Gemini.** It cannot be called via LLM tool declarations. It is executed solely by the backend worker upon receiving a valid human approval HTTP request.
  - Whitelisted static ATS API endpoints eliminate SSRF risks.

### 3.7 Finding 7: Career Vault Privacy Governance & Skill Segregation
- **Problem:** AI could store long-term memory without explicit consent or falsely verify candidate credentials.
- **Resolution:**
  - Changed default to `ai_memory_consent = false` (explicit opt-in required).
  - Segregated skills into `detected_skills` (AI-extracted) and `verified_skills` (candidate-confirmed). The AI is strictly barred from promoting skills to verified status.
  - Provided immediate one-click deletion via `DELETE /api/v1/profiles/career-vault`.

### 3.8 Finding 8: Tool Catalog & Implementation Roadmap Synchronization
- **Problem:** Minor discrepancies existed between tool names, costs, and phase deliverables.
- **Resolution:**
  - All 15 tools are now identically named, categorized, and path-specified across all documents:
    1. `read-resume.tool.ts` (`read_resume` - READ_ONLY)
    2. `read-resume-versions.tool.ts` (`read_resume_versions` - READ_ONLY)
    3. `search-jobs.tool.ts` (`search_discovered_jobs` - READ_ONLY)
    4. `read-career-profile.tool.ts` (`read_career_profile` - READ_ONLY)
    5. `run-ats-audit.tool.ts` (`run_ats_audit` - AI_ANALYSIS, 0 credits)
    6. `match-job.tool.ts` (`match_job_description` - AI_ANALYSIS, 1 credit)
    7. `generate-bullets.tool.ts` (`generate_bullet_variations` - AI_ANALYSIS, 1 credit)
    8. `propose-edits.tool.ts` (`propose_resume_edits` - AI_ANALYSIS, 2 credits)
    9. `generate-cover-letter.tool.ts` (`generate_cover_letter` - AI_ANALYSIS, 2 credits)
    10. `start-interview.tool.ts` (`start_interview_session` - AI_ANALYSIS, 2 credits)
    11. `save-job.tool.ts` (`save_job_to_tracker` - SAFE_MUTATING, 0 credits)
    12. `create-resume.tool.ts` (`create_resume` - SAFE_MUTATING, 0 credits)
    13. `apply-edits.tool.ts` (`apply_approved_edits` - STATE_MUTATING, 0 credits, Approval Required)
    14. `restore-version.tool.ts` (`restore_resume_version` - STATE_MUTATING, 0 credits, Approval Required)
    15. `update-career-profile.tool.ts` (`update_career_profile` - STATE_MUTATING, 0 credits, Approval Required)

### 3.9 Finding 9: Factual Integrity & Evidence Provenance
- **Problem:** AI might invent metrics or credentials during rewriting without evidence.
- **Resolution:**
  - `propose_resume_edits` outputs an `evidenceProvenance` object for every modified bullet, citing the original bullet index and quote.
  - Any added metric is flagged with `candidateConfirmationRequired = true`.
  - The frontend UI displays confirmation checkboxes before the `[Approve & Apply]` button becomes active.

### 3.10 Finding 10: Frontend Streaming Filter
- **Problem:** Streaming raw internal prompt thoughts can confuse users, expose system instructions, and clutter the UI.
- **Resolution:**
  - Filtered SSE streams to deliver clean user-facing progress events (`task_status`, `plan_progress`, `approval_requested`, `message_chunk`).
  - Raw chain-of-thought is logged internally in `agent_tool_executions` for auditing but never streamed to the client.

### 3.11 Finding 11: Testing Strategy & Synthetic Data Standard
- **Problem:** Lack of tests for distributed concurrency and potential real PII in test fixtures.
- **Resolution:**
  - Added dedicated test suites for lease fencing rejection, proposal hash mismatch, optimistic version collisions, credit reservation races, and EventSource ticket auth.
  - Standardized all fixtures on strictly synthetic candidate profiles (`Alexander Sharma`, `alexander.sharma.test@example.com`).

---

## 4. Formal Architectural Decision Records (ADRs) with Status

| ADR ID | Title | Status |
| :--- | :--- | :--- |
| **ADR-01** | Native Gemini Function Calling over REST (No LangChain/CrewAI) | `[APPROVED]` |
| **ADR-02** | SSE Stream Transport with Ticket Authentication & PostgreSQL `pg_notify` | `[APPROVED]` |
| **ADR-03** | PostgreSQL 14+ Persistence with TypeORM | `[APPROVED]` |
| **ADR-04** | PostgreSQL Durable Task Worker with Monotonic Lease Fencing Tokens | `[APPROVED]` |
| **ADR-05** | Cryptographic Human-In-The-Loop Approval (SHA-256 Hash + Version Locking) | `[APPROVED]` |
| **ADR-06** | 4-Tier Tool Permission Matrix (READ_ONLY, AI_ANALYSIS, SAFE_MUTATING, STATE_MUTATING) | `[APPROVED]` |
| **ADR-07** | Two-Phase Credit Reservation Lifecycle (Reserve -> Commit / Release) | `[APPROVED]` |
| **ADR-08** | Career Vault Explicit Opt-In & Segregation of Verified vs. Detected Skills | `[APPROVED]` |
| **ADR-09** | Configurable Per-Task Credit Spending Ceiling (Default: 6 Credits) | `[REQUIRES USER DECISION]` |
| **ADR-10** | Worker Heartbeat Interval (5s) & Stale Lease Expiry Threshold (60s) | `[REQUIRES USER DECISION]` |
| **ADR-11** | Staged Proposal Expiration Window (15 Minutes) | `[REQUIRES USER DECISION]` |

---

## 5. Remaining Decisions Requiring User Input

The following 3 operational parameters have sensible defaults specified in the architecture, but are flagged as `[REQUIRES USER DECISION]` for final confirmation:

1. **Task Credit Spending Ceiling (ADR-09):**  
   *Current Default:* 6 credits max per task.  
   *Question:* Is a 6-credit ceiling appropriate, or should it be configurable per user tier (e.g. 10 credits for Pro users)?
2. **Stale Lease Expiry Duration (ADR-10):**  
   *Current Default:* 60 seconds of worker heartbeat silence before another worker can re-lease.  
   *Question:* Does 60 seconds provide sufficient headroom for long Gemini generations (25s timeout), or should it be increased to 90 seconds?
3. **Proposal Expiry Window (ADR-11):**  
   *Current Default:* 15 minutes before an unapproved proposal expires and requires re-generation.  
   *Question:* Is 15 minutes optimal, or would you prefer 30 minutes for candidates carefully reviewing multi-section diffs?

---

*End of Architecture Changelog Revision 2.0.*

