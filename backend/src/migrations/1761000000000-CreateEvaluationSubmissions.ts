import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEvaluationSubmissions1761000000000 implements MigrationInterface {
  name = 'CreateEvaluationSubmissions1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "evaluation_submissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "reponses" jsonb NOT NULL,
        "soumis_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "evaluation_id" uuid NOT NULL,
        "participant_id" uuid NOT NULL,
        CONSTRAINT "PK_evaluation_submissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_evaluation_submissions_evaluation" FOREIGN KEY ("evaluation_id")
          REFERENCES "evaluations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_evaluation_submissions_participant" FOREIGN KEY ("participant_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_evaluation_submissions_evaluation_participant"
          UNIQUE ("evaluation_id", "participant_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_evaluation_submissions_participant_id"
      ON "evaluation_submissions" ("participant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_evaluation_submissions_participant_id"');
    await queryRunner.query('DROP TABLE "evaluation_submissions"');
  }
}
