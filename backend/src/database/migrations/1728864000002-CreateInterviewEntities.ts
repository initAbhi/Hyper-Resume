import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInterviewEntities1728864000002 implements MigrationInterface {
  name = 'CreateInterviewEntities1728864000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create interview_sessions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interview_sessions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "job_description_id" UUID NULL REFERENCES "job_descriptions"("id") ON DELETE SET NULL,
        "session_mode" VARCHAR(50) NOT NULL,
        "target_role" VARCHAR(100) NOT NULL,
        "difficulty" VARCHAR(20) NOT NULL DEFAULT 'mid',
        "status" VARCHAR(30) NOT NULL DEFAULT 'initializing',
        "is_free_trial" BOOLEAN NOT NULL DEFAULT false,
        "total_questions" INT NOT NULL,
        "current_question_index" INT NOT NULL DEFAULT 0,
        "overall_score" INT NULL,
        "score_breakdown" JSONB NULL,
        "summary_feedback" JSONB NULL,
        "credits_charged" INT NOT NULL DEFAULT 0,
        "idempotency_key" VARCHAR(255) NULL,
        "total_input_tokens" INT NOT NULL DEFAULT 0,
        "total_output_tokens" INT NOT NULL DEFAULT 0,
        "thinking_tokens" INT NOT NULL DEFAULT 0,
        "estimated_cost_usd" DECIMAL(10, 6) NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "completed_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_interview_sessions_user_status" ON "interview_sessions"("user_id", "status");
      CREATE INDEX IF NOT EXISTS "idx_interview_sessions_user_created" ON "interview_sessions"("user_id", "created_at" DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_one_free_trial_per_user" ON "interview_sessions"("user_id") WHERE "is_free_trial" = true AND "status" IN ('initializing', 'in_progress', 'completed');
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_interview_sessions_idempotency" ON "interview_sessions"("user_id", "idempotency_key") WHERE "idempotency_key" IS NOT NULL;
    `);

    // 2. Create interview_questions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interview_questions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "session_id" UUID NOT NULL REFERENCES "interview_sessions"("id") ON DELETE CASCADE,
        "order_index" INT NOT NULL,
        "category" VARCHAR(50) NOT NULL,
        "question_text" TEXT NOT NULL,
        "context_hint" TEXT NULL,
        "ideal_answer_outline" TEXT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_interview_questions_session_order" ON "interview_questions"("session_id", "order_index");
    `);

    // 3. Create interview_turns table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interview_turns" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "session_id" UUID NOT NULL REFERENCES "interview_sessions"("id") ON DELETE CASCADE,
        "question_id" UUID NOT NULL REFERENCES "interview_questions"("id") ON DELETE CASCADE,
        "status" VARCHAR(30) NOT NULL DEFAULT 'evaluating',
        "candidate_answer" TEXT NOT NULL DEFAULT '',
        "time_taken_seconds" INT NOT NULL DEFAULT 0,
        "turn_score" INT NULL,
        "evaluation" JSONB NULL,
        "follow_up_question" TEXT NULL,
        "follow_up_answer" TEXT NULL,
        "follow_up_score" INT NULL,
        "follow_up_status" VARCHAR(30) NULL,
        "evaluated_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_interview_turns_session_q_unique" ON "interview_turns"("session_id", "question_id");
      CREATE INDEX IF NOT EXISTS "idx_interview_turns_session_id" ON "interview_turns"("session_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_turns";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_questions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_sessions";`);
  }
}

