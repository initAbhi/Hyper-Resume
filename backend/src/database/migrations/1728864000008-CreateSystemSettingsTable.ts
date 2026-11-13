import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSettingsTable1728864000008
  implements MigrationInterface
{
  name = 'CreateSystemSettingsTable1728864000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "key" VARCHAR(100) PRIMARY KEY,
        "value" TEXT NOT NULL,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      INSERT INTO "system_settings" ("key", "value", "updated_at")
      VALUES ('payment_mode', 'test_mode', now())
      ON CONFLICT ("key") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "system_settings";
    `);
  }
}

