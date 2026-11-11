import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProEntitlementsAndAnalytics1728864000007
  implements MigrationInterface
{
  name = 'AddProEntitlementsAndAnalytics1728864000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "pro_plan_id" VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS "pro_expires_at" TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS "is_lifetime_pro" BOOLEAN NOT NULL DEFAULT false;

      ALTER TABLE "job_applications"
        ADD COLUMN IF NOT EXISTS "job_description_id" UUID NULL REFERENCES "job_descriptions"("id") ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS "analytics_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_type" VARCHAR(80) NOT NULL,
        "path" VARCHAR(255) NULL,
        "referrer" VARCHAR(500) NULL,
        "utm_source" VARCHAR(120) NULL,
        "utm_medium" VARCHAR(120) NULL,
        "utm_campaign" VARCHAR(120) NULL,
        "session_hash" VARCHAR(128) NULL,
        "user_id" UUID NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS "idx_analytics_events_type_created"
        ON "analytics_events"("event_type", "created_at" DESC);

      CREATE INDEX IF NOT EXISTS "idx_analytics_events_session_hash"
        ON "analytics_events"("session_hash");

      CREATE INDEX IF NOT EXISTS "idx_analytics_events_created"
        ON "analytics_events"("created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "analytics_events";
      ALTER TABLE "job_applications" DROP COLUMN IF EXISTS "job_description_id";
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "is_lifetime_pro",
        DROP COLUMN IF EXISTS "pro_expires_at",
        DROP COLUMN IF EXISTS "pro_plan_id";
    `);
  }
}

