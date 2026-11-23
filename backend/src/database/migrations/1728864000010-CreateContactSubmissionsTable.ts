import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactSubmissionsTable1728864000010
  implements MigrationInterface
{
  name = 'CreateContactSubmissionsTable1728864000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "full_name" VARCHAR(120) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "topic" VARCHAR(40) NOT NULL,
        "subject" VARCHAR(200) NOT NULL,
        "message" TEXT NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'new',
        "user_id" uuid NULL,
        "ip_hash" VARCHAR(64) NULL,
        "user_agent" VARCHAR(255) NULL,
        "admin_notes" TEXT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contact_submissions_email"
      ON "contact_submissions" ("email");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contact_submissions_status"
      ON "contact_submissions" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contact_submissions_created_at"
      ON "contact_submissions" ("created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_submissions";`);
  }
}
