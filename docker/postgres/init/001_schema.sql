CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'ADMIN'
);

CREATE TYPE exercise_difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);

CREATE TYPE exercise_progress_status AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SOLVED'
);

CREATE TYPE ai_message_role AS ENUM (
    'SYSTEM',
    'USER',
    'ASSISTANT'
);

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       email VARCHAR(255) NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,

                       first_name VARCHAR(100),
                       last_name VARCHAR(100),

                       role user_role NOT NULL DEFAULT 'STUDENT',

                       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX users_email_unique_idx
    ON users (LOWER(email));

CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                token_hash VARCHAR(255) NOT NULL,

                                user_id UUID NOT NULL,

                                expires_at TIMESTAMPTZ NOT NULL,
                                revoked_at TIMESTAMPTZ,

                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                CONSTRAINT fk_refresh_tokens_user
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(id)
                                        ON DELETE CASCADE
);
CREATE INDEX refresh_tokens_user_id_idx
    ON refresh_tokens(user_id);

CREATE INDEX refresh_tokens_expires_at_idx
    ON refresh_tokens(expires_at);

CREATE TABLE learning_cases (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                title VARCHAR(255) NOT NULL,
                                slug VARCHAR(255) NOT NULL UNIQUE,

                                description TEXT,

                                difficulty exercise_difficulty NOT NULL DEFAULT 'EASY',

                                database_name VARCHAR(255) NOT NULL,

                                is_published BOOLEAN NOT NULL DEFAULT FALSE,

                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                           case_id UUID NOT NULL,

                           title VARCHAR(255) NOT NULL,
                           description TEXT NOT NULL,

                           difficulty exercise_difficulty NOT NULL DEFAULT 'EASY',

                           sort_order INTEGER NOT NULL,

                           is_published BOOLEAN NOT NULL DEFAULT FALSE,

                           created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                           updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                           CONSTRAINT fk_exercises_case
                               FOREIGN KEY (case_id)
                                   REFERENCES learning_cases(id)
                                   ON DELETE RESTRICT,

                           CONSTRAINT exercises_case_sort_order_unique
                               UNIQUE (case_id, sort_order)
);

CREATE TABLE exercise_solutions (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                    exercise_id UUID NOT NULL UNIQUE,

                                    query TEXT NOT NULL,

                                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                    CONSTRAINT fk_exercise_solutions_exercise
                                        FOREIGN KEY (exercise_id)
                                            REFERENCES exercises(id)
                                            ON DELETE CASCADE
);

CREATE TABLE exercise_hints (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                exercise_id UUID NOT NULL,

                                level INTEGER NOT NULL,

                                content TEXT NOT NULL,

                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                CONSTRAINT fk_exercise_hints_exercise
                                    FOREIGN KEY (exercise_id)
                                        REFERENCES exercises(id)
                                        ON DELETE CASCADE,

                                CONSTRAINT exercise_hints_level_check
                                    CHECK (level > 0),

                                CONSTRAINT exercise_hints_level_unique
                                    UNIQUE (exercise_id, level)
);

CREATE TABLE submissions (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             user_id UUID NOT NULL,
                             exercise_id UUID NOT NULL,

                             query TEXT NOT NULL,

                             is_correct BOOLEAN NOT NULL,

                             execution_time_ms INTEGER,

                             error_message TEXT,

                             created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                             CONSTRAINT fk_submissions_user
                                 FOREIGN KEY (user_id)
                                     REFERENCES users(id)
                                     ON DELETE CASCADE,

                             CONSTRAINT fk_submissions_exercise
                                 FOREIGN KEY (exercise_id)
                                     REFERENCES exercises(id)
                                     ON DELETE RESTRICT,

                             CONSTRAINT submissions_execution_time_check
                                 CHECK (
                                     execution_time_ms IS NULL
                                         OR execution_time_ms >= 0
                                     )
);
CREATE INDEX submissions_user_id_idx
    ON submissions(user_id);

CREATE INDEX submissions_exercise_id_idx
    ON submissions(exercise_id);

CREATE INDEX submissions_created_at_idx
    ON submissions(created_at);

CREATE TABLE user_exercise_progress (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                        user_id UUID NOT NULL,
                                        exercise_id UUID NOT NULL,

                                        status exercise_progress_status NOT NULL DEFAULT 'NOT_STARTED',

                                        attempts_count INTEGER NOT NULL DEFAULT 0,

                                        solved_at TIMESTAMPTZ,
                                        last_attempt_at TIMESTAMPTZ,

                                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                        CONSTRAINT fk_progress_user
                                            FOREIGN KEY (user_id)
                                                REFERENCES users(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT fk_progress_exercise
                                            FOREIGN KEY (exercise_id)
                                                REFERENCES exercises(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT user_exercise_progress_unique
                                            UNIQUE (user_id, exercise_id),

                                        CONSTRAINT attempts_count_check
                                            CHECK (attempts_count >= 0)
);

CREATE TABLE ai_conversations (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                  user_id UUID NOT NULL,

                                  exercise_id UUID,

                                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                  CONSTRAINT fk_ai_conversations_user
                                      FOREIGN KEY (user_id)
                                          REFERENCES users(id)
                                          ON DELETE CASCADE,

                                  CONSTRAINT fk_ai_conversations_exercise
                                      FOREIGN KEY (exercise_id)
                                          REFERENCES exercises(id)
                                          ON DELETE SET NULL
);

CREATE TABLE ai_messages (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             conversation_id UUID NOT NULL,

                             role ai_message_role NOT NULL,

                             content TEXT NOT NULL,

                             created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                             CONSTRAINT fk_ai_messages_conversation
                                 FOREIGN KEY (conversation_id)
                                     REFERENCES ai_conversations(id)
                                     ON DELETE CASCADE
);
CREATE INDEX ai_messages_conversation_id_idx
    ON ai_messages(conversation_id);

CREATE INDEX ai_messages_created_at_idx
    ON ai_messages(created_at);

CREATE TABLE telegram_accounts (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                   user_id UUID NOT NULL UNIQUE,

                                   telegram_user_id BIGINT NOT NULL UNIQUE,

                                   username VARCHAR(255),

                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                   CONSTRAINT fk_telegram_accounts_user
                                       FOREIGN KEY (user_id)
                                           REFERENCES users(id)
                                           ON DELETE CASCADE
);

CREATE TABLE achievements (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                              code VARCHAR(100) NOT NULL UNIQUE,

                              title VARCHAR(255) NOT NULL,

                              description TEXT NOT NULL,

                              icon VARCHAR(255),

                              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
                                   user_id UUID NOT NULL,
                                   achievement_id UUID NOT NULL,

                                   unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                   PRIMARY KEY (user_id, achievement_id),

                                   CONSTRAINT fk_user_achievements_user
                                       FOREIGN KEY (user_id)
                                           REFERENCES users(id)
                                           ON DELETE CASCADE,

                                   CONSTRAINT fk_user_achievements_achievement
                                       FOREIGN KEY (achievement_id)
                                           REFERENCES achievements(id)
                                           ON DELETE CASCADE
);