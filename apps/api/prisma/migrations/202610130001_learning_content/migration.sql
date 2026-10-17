CREATE TYPE "learning_node_type" AS ENUM ('LECTURE', 'EXERCISE');

CREATE TABLE "lectures" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "summary" TEXT,
  "content" JSONB NOT NULL,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 10,
  "difficulty" "exercise_difficulty" NOT NULL DEFAULT 'EASY',
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lectures_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "lectures_slug_key" ON "lectures"("slug");
CREATE INDEX "lectures_is_published_idx" ON "lectures"("is_published");

CREATE TABLE "learning_path_nodes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL,
  "type" "learning_node_type" NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "sort_order" INTEGER NOT NULL,
  "lecture_id" UUID,
  "exercise_id" UUID,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learning_path_nodes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "learning_path_nodes_case_order_unique" ON "learning_path_nodes"("case_id", "sort_order");
CREATE INDEX "learning_path_nodes_lecture_id_idx" ON "learning_path_nodes"("lecture_id");
CREATE INDEX "learning_path_nodes_exercise_id_idx" ON "learning_path_nodes"("exercise_id");
ALTER TABLE "learning_path_nodes" ADD CONSTRAINT "fk_learning_path_nodes_case"
  FOREIGN KEY ("case_id") REFERENCES "learning_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_nodes" ADD CONSTRAINT "fk_learning_path_nodes_lecture"
  FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_nodes" ADD CONSTRAINT "fk_learning_path_nodes_exercise"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "lecture_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "lecture_id" UUID NOT NULL,
  "last_position" INTEGER NOT NULL DEFAULT 0,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lecture_progress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "lecture_progress_user_lecture_unique" ON "lecture_progress"("user_id", "lecture_id");
CREATE INDEX "lecture_progress_user_id_idx" ON "lecture_progress"("user_id");
ALTER TABLE "lecture_progress" ADD CONSTRAINT "fk_lecture_progress_user"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lecture_progress" ADD CONSTRAINT "fk_lecture_progress_lecture"
  FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
