import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLinkedInAuditsTable1728864000006
  implements MigrationInterface
{
  name = 'CreateLinkedInAuditsTable1728864000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "linkedin_audits" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_id" UUID NULL REFERENCES "resumes"("id") ON DELETE SET NULL,
        "title" VARCHAR(200) NOT NULL,
        "target_role" VARCHAR(180) NOT NULL,
        "industry" VARCHAR(150) NULL,
        "tone" VARCHAR(40) NOT NULL DEFAULT 'Executive',
        "source_type" VARCHAR(30) NOT NULL DEFAULT 'resume',
        "linkedin_url" VARCHAR(255) NULL,
        "overall_score" INTEGER NOT NULL DEFAULT 0,
        "profile_snapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "score_report" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "optimizations" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "applied_state" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "provider" VARCHAR(40) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_linkedin_audits_user_updated"
        ON "linkedin_audits"("user_id", "updated_at" DESC);

      CREATE INDEX IF NOT EXISTS "idx_linkedin_audits_resume_id"
        ON "linkedin_audits"("resume_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "linkedin_audits";
    `);
  }
}

