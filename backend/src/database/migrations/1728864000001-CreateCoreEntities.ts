import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreEntities1728864000001 implements MigrationInterface {
  name = 'CreateCoreEntities1728864000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Alter users table to add is_email_verified
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN NOT NULL DEFAULT false;
    `);

    // 2. Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" VARCHAR(255) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "is_revoked" BOOLEAN NOT NULL DEFAULT false,
        "user_agent" VARCHAR(255) NULL,
        "ip_address" VARCHAR(45) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_user_sessions_token_hash" ON "user_sessions"("token_hash");
    `);

    // 3. Create candidate_profiles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "candidate_profiles" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "headline" VARCHAR(200) NOT NULL DEFAULT '',
        "summary" TEXT NOT NULL DEFAULT '',
        "location" VARCHAR(150) NOT NULL DEFAULT '',
        "phone" VARCHAR(50) NULL,
        "linkedin_url" VARCHAR(255) NULL,
        "github_url" VARCHAR(255) NULL,
        "website_url" VARCHAR(255) NULL,
        "skills" JSONB NOT NULL DEFAULT '[]',
        "experience" JSONB NOT NULL DEFAULT '[]',
        "education" JSONB NOT NULL DEFAULT '[]',
        "projects" JSONB NOT NULL DEFAULT '[]',
        "certifications" JSONB NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_candidate_profiles_user_id" ON "candidate_profiles"("user_id");
    `);

    // 4. Create resumes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resumes" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" VARCHAR(200) NOT NULL,
        "template_key" VARCHAR(100) NOT NULL DEFAULT 'clean-modern',
        "locale" VARCHAR(20) NOT NULL DEFAULT 'en-US',
        "is_master" BOOLEAN NOT NULL DEFAULT false,
        "is_archived" BOOLEAN NOT NULL DEFAULT false,
        "version" INT NOT NULL DEFAULT 1,
        "content" JSONB NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_resumes_user_id" ON "resumes"("user_id");
    `);

    // 5. Create resume_versions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resume_versions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "version_number" INT NOT NULL,
        "change_summary" VARCHAR(255) NOT NULL,
        "content_snapshot" JSONB NOT NULL,
        "job_match_id" UUID NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_resume_versions_resume_id" ON "resume_versions"("resume_id");
    `);

    // 6. Create resume_analyses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resume_analyses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "analysis_type" VARCHAR(50) NOT NULL,
        "score" INT NOT NULL,
        "findings" JSONB NOT NULL DEFAULT '{}',
        "recommendations" JSONB NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_resume_analyses_user_id" ON "resume_analyses"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_resume_analyses_resume_id" ON "resume_analyses"("resume_id");
    `);

    // 7. Create job_descriptions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "job_descriptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(200) NOT NULL,
        "company_name" VARCHAR(150) NULL,
        "original_text" TEXT NOT NULL,
        "parsed_requirements" JSONB NOT NULL DEFAULT '[]',
        "source_url" VARCHAR(500) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_job_descriptions_user_id" ON "job_descriptions"("user_id");
    `);

    // 8. Create job_matches table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "job_matches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_id" UUID NOT NULL REFERENCES "resumes"("id") ON DELETE CASCADE,
        "job_description_id" UUID NOT NULL REFERENCES "job_descriptions"("id") ON DELETE CASCADE,
        "overall_score" INT NOT NULL,
        "score_components" JSONB NOT NULL,
        "requirements_analysis" JSONB NOT NULL,
        "recommendations" JSONB NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_job_matches_user_id" ON "job_matches"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_job_matches_resume_id" ON "job_matches"("resume_id");
      CREATE INDEX IF NOT EXISTS "idx_job_matches_job_description_id" ON "job_matches"("job_description_id");
    `);

    // 9. Create templates table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "template_key" VARCHAR(100) NOT NULL UNIQUE,
        "name" VARCHAR(150) NOT NULL,
        "description" VARCHAR(500) NOT NULL,
        "is_free" BOOLEAN NOT NULL DEFAULT true,
        "layout_options" JSONB NOT NULL DEFAULT '{}',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_templates_template_key" ON "templates"("template_key");
    `);

    // 10. Create job_applications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "job_applications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "resume_version_id" UUID NULL REFERENCES "resume_versions"("id") ON DELETE SET NULL,
        "company" VARCHAR(150) NOT NULL,
        "role" VARCHAR(150) NOT NULL,
        "job_url" VARCHAR(500) NULL,
        "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
        "applied_date" DATE NULL,
        "notes" TEXT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_job_applications_user_id" ON "job_applications"("user_id");
    `);

    // 11. Create credit_ledger table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "credit_ledger" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" INT NOT NULL,
        "transaction_type" VARCHAR(50) NOT NULL,
        "idempotency_key" VARCHAR(255) NOT NULL UNIQUE,
        "description" VARCHAR(255) NOT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_credit_ledger_user_id" ON "credit_ledger"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_credit_ledger_idempotency_key" ON "credit_ledger"("idempotency_key");
    `);

    // 12. Create payments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider" VARCHAR(50) NOT NULL,
        "provider_transaction_id" VARCHAR(255) NOT NULL UNIQUE,
        "order_id" VARCHAR(255) NOT NULL,
        "amount_minor" INT NOT NULL,
        "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
        "idempotency_key" VARCHAR(255) NOT NULL UNIQUE,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_payments_user_id" ON "payments"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_payments_provider_tx_id" ON "payments"("provider_transaction_id");
      CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "payments"("order_id");
      CREATE INDEX IF NOT EXISTS "idx_payments_idempotency_key" ON "payments"("idempotency_key");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_ledger";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_applications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "templates";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_matches";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_descriptions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resume_analyses";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resume_versions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resumes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_profiles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions";`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_email_verified";`);
  }
}
