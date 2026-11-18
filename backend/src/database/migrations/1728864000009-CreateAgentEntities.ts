import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentEntities1728864000009 implements MigrationInterface {
  name = 'CreateAgentEntities1728864000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create agent_conversations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_conversations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NULL,
        "active_resume_id" UUID NULL REFERENCES "resumes"("id") ON DELETE SET NULL,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_conversations_user"
        ON "agent_conversations"("user_id");
    `);

    // 2. Create agent_messages table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_messages" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id" UUID NOT NULL REFERENCES "agent_conversations"("id") ON DELETE CASCADE,
        "role" VARCHAR(50) NOT NULL,
        "content" TEXT NOT NULL,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_messages_conversation_id"
        ON "agent_messages"("conversation_id");
    `);

    // 3. Create agent_tasks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_tasks" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id" UUID NOT NULL REFERENCES "agent_conversations"("id") ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        "task_input" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "fence_token" INT NOT NULL DEFAULT 0,
        "heartbeat_at" TIMESTAMPTZ NULL,
        "lease_token" VARCHAR(255) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_tasks_status_heartbeat"
        ON "agent_tasks"("status", "heartbeat_at");

      CREATE INDEX IF NOT EXISTS "idx_agent_tasks_conversation_id"
        ON "agent_tasks"("conversation_id");

      CREATE INDEX IF NOT EXISTS "idx_agent_tasks_user_id"
        ON "agent_tasks"("user_id");
    `);

    // 4. Create agent_tool_executions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_tool_executions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" UUID NOT NULL REFERENCES "agent_tasks"("id") ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "tool_name" VARCHAR(100) NOT NULL,
        "step_index" INT NOT NULL DEFAULT 0,
        "input_arguments" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "output_payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        "idempotency_key" VARCHAR(255) NULL,
        "proposal_hash" VARCHAR(64) NULL,
        "expected_resume_version" INT NULL,
        "resume_id" UUID NULL,
        "is_consumed" BOOLEAN NOT NULL DEFAULT false,
        "expires_at" TIMESTAMPTZ NULL,
        "approved_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_tool_executions_task_step"
        ON "agent_tool_executions"("task_id", "step_index");

      CREATE INDEX IF NOT EXISTS "idx_agent_tool_executions_proposal_hash"
        ON "agent_tool_executions"("proposal_hash");

      CREATE INDEX IF NOT EXISTS "idx_agent_tool_executions_user_id"
        ON "agent_tool_executions"("user_id");
    `);

    // 5. Create agent_task_events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_task_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" UUID NOT NULL REFERENCES "agent_tasks"("id") ON DELETE CASCADE,
        "conversation_id" UUID NOT NULL REFERENCES "agent_conversations"("id") ON DELETE CASCADE,
        "sequence_number" BIGSERIAL NOT NULL,
        "event_type" VARCHAR(100) NOT NULL,
        "event_payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_task_events_seq"
        ON "agent_task_events"("conversation_id", "sequence_number");

      CREATE INDEX IF NOT EXISTS "idx_agent_task_events_task_id"
        ON "agent_task_events"("task_id");
    `);

    // 6. Create agent_stream_tickets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_stream_tickets" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id" UUID NOT NULL REFERENCES "agent_conversations"("id") ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "ticket_hash" VARCHAR(64) NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "consumed_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_agent_stream_tickets_hash"
        ON "agent_stream_tickets"("ticket_hash");

      CREATE INDEX IF NOT EXISTS "idx_agent_stream_tickets_conversation_id"
        ON "agent_stream_tickets"("conversation_id");

      CREATE INDEX IF NOT EXISTS "idx_agent_stream_tickets_user_id"
        ON "agent_stream_tickets"("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_stream_tickets" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_task_events" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_tool_executions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_tasks" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_messages" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_conversations" CASCADE;`);
  }
}

