import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResumeAdaptationsTable1728864000003 implements MigrationInterface {
  name = 'CreateResumeAdaptationsTable1728864000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resume_adaptations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "source_resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "sample_id" VARCHAR(100) NOT NULL,
        "adaptation_type" VARCHAR(50) NOT NULL DEFAULT 'full_profile',
        "target_role" VARCHAR(200) NULL,
        "idempotency_key" VARCHAR(255) NOT NULL,
        "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        "credits_charged" INT NOT NULL DEFAULT 0,
        "proposed_content" JSONB NULL,
        "section_changes" JSONB NULL,
        "unsupported_warnings" JSONB NULL,
        "recommended_benchmark_skills" JSONB NULL,
        "usage_metadata" JSONB NULL,
        "error_code" VARCHAR(100) NULL,
        "error_message" TEXT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "idx_resume_adaptations_user_idempotency" 
        ON "resume_adaptations"("user_id", "idempotency_key");

      CREATE INDEX IF NOT EXISTS "idx_resume_adaptations_user_status" 
        ON "resume_adaptations"("user_id", "status");

      CREATE INDEX IF NOT EXISTS "idx_resume_adaptations_source_resume" 
        ON "resume_adaptations"("source_resume_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "resume_adaptations";`);
  }
}

