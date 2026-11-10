import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResumeSharesTables1728864000005
  implements MigrationInterface
{
  name = 'CreateResumeSharesTables1728864000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resume_shares" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "resume_id" UUID NOT NULL UNIQUE REFERENCES "resumes"("id") ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "slug" VARCHAR(100) NOT NULL UNIQUE,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "allow_pdf_download" BOOLEAN NOT NULL DEFAULT true,
        "allow_docx_download" BOOLEAN NOT NULL DEFAULT true,
        "hide_contact_details" BOOLEAN NOT NULL DEFAULT false,
        "recruiter_note" VARCHAR(280) NULL,
        "expires_at" TIMESTAMPTZ NULL,
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "unique_visitor_count" INTEGER NOT NULL DEFAULT 0,
        "download_count" INTEGER NOT NULL DEFAULT 0,
        "last_viewed_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_resume_shares_user_id"
        ON "resume_shares"("user_id");

      CREATE TABLE IF NOT EXISTS "resume_share_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "share_id" UUID NOT NULL REFERENCES "resume_shares"("id") ON DELETE CASCADE,
        "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "event_type" VARCHAR(30) NOT NULL,
        "visitor_hash" VARCHAR(64) NULL,
        "referrer" VARCHAR(255) NULL,
        "device_type" VARCHAR(20) NOT NULL DEFAULT 'desktop',
        "browser" VARCHAR(40) NULL,
        "os" VARCHAR(40) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_resume_share_events_share_created"
        ON "resume_share_events"("share_id", "created_at" DESC);

      CREATE INDEX IF NOT EXISTS "idx_resume_share_events_share_visitor"
        ON "resume_share_events"("share_id", "visitor_hash");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "resume_share_events";
      DROP TABLE IF EXISTS "resume_shares";
    `);
  }
}

