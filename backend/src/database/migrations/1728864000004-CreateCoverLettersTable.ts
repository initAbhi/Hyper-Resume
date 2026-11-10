import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoverLettersTable1728864000004
  implements MigrationInterface
{
  name = 'CreateCoverLettersTable1728864000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cover_letters" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_id" UUID NULL REFERENCES "resumes"("id") ON DELETE SET NULL,
        "job_match_id" UUID NULL REFERENCES "job_matches"("id") ON DELETE SET NULL,
        "title" VARCHAR(200) NOT NULL,
        "target_role" VARCHAR(180) NOT NULL,
        "company_name" VARCHAR(180) NOT NULL,
        "hiring_manager" VARCHAR(140) NULL,
        "job_description" TEXT NULL,
        "tone" VARCHAR(40) NOT NULL DEFAULT 'Executive',
        "template_key" VARCHAR(40) NOT NULL DEFAULT 'executive',
        "accent_color" VARCHAR(20) NOT NULL DEFAULT '#285FEA',
        "sender_name" VARCHAR(150) NOT NULL,
        "sender_email" VARCHAR(150) NULL,
        "sender_phone" VARCHAR(80) NULL,
        "sender_location" VARCHAR(150) NULL,
        "recipient_line" VARCHAR(220) NULL,
        "salutation" VARCHAR(150) NOT NULL DEFAULT 'Dear Hiring Team,',
        "opening_paragraph" TEXT NOT NULL,
        "body_paragraphs" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "closing_paragraph" TEXT NOT NULL,
        "sign_off" VARCHAR(120) NOT NULL DEFAULT 'Sincerely,',
        "highlighted_keywords" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "factual_verification_notes" TEXT NULL,
        "provider" VARCHAR(40) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_cover_letters_user_updated"
        ON "cover_letters"("user_id", "updated_at" DESC);

      CREATE INDEX IF NOT EXISTS "idx_cover_letters_resume_id"
        ON "cover_letters"("resume_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cover_letters";`);
  }
}

