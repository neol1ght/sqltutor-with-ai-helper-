


-- ============================================================
-- 011_training_school.sql
-- Создание учебной базы данных sqltutor_training_school
-- ============================================================

CREATE DATABASE sqltutor_training_school OWNER postgres;

\connect sqltutor_training_school

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          first_name VARCHAR(100) NOT NULL,
                          last_name VARCHAR(100) NOT NULL,

                          email VARCHAR(255) NOT NULL UNIQUE,

                          birth_date DATE NOT NULL,

                          city VARCHAR(100) NOT NULL,

                          enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TEACHERS
-- ============================================================

CREATE TABLE teachers (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          first_name VARCHAR(100) NOT NULL,
                          last_name VARCHAR(100) NOT NULL,

                          email VARCHAR(255) NOT NULL UNIQUE,

                          department VARCHAR(100) NOT NULL,

                          hired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- COURSES
-- ============================================================

CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                         teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,

                         name VARCHAR(255) NOT NULL,

                         department VARCHAR(100) NOT NULL,

                         credits INTEGER NOT NULL,

                         price NUMERIC(10, 2) NOT NULL,

                         CONSTRAINT courses_credits_check
                             CHECK (credits > 0),

                         CONSTRAINT courses_price_check
                             CHECK (price >= 0)
);


-- ============================================================
-- ENROLLMENTS
-- ============================================================

CREATE TABLE enrollments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             student_id UUID NOT NULL
                                 REFERENCES students(id)
                                     ON DELETE CASCADE,

                             course_id UUID NOT NULL
                                 REFERENCES courses(id)
                                     ON DELETE CASCADE,

                             enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                             status VARCHAR(30) NOT NULL DEFAULT 'active',

                             CONSTRAINT enrollments_status_check
                                 CHECK (




-- ============================================================
-- 011_training_school.sql
-- Создание учебной базы данных sqltutor_training_school
-- ============================================================

                                     CREATE DATABASE sqltutor_training_school OWNER postgres;

\connect sqltutor_training_school

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          first_name VARCHAR(100) NOT NULL,
                          last_name VARCHAR(100) NOT NULL,

                          email VARCHAR(255) NOT NULL UNIQUE,

                          birth_date DATE NOT NULL,

                          city VARCHAR(100) NOT NULL,

                          enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TEACHERS
-- ============================================================

CREATE TABLE teachers (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          first_name VARCHAR(100) NOT NULL,
                          last_name VARCHAR(100) NOT NULL,

                          email VARCHAR(255) NOT NULL UNIQUE,

                          department VARCHAR(100) NOT NULL,

                          hired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- COURSES
-- ============================================================

CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                         teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,

                         name VARCHAR(255) NOT NULL,

                         department VARCHAR(100) NOT NULL,

                         credits INTEGER NOT NULL,

                         price NUMERIC(10, 2) NOT NULL,

                         CONSTRAINT courses_credits_check
                             CHECK (credits > 0),

                         CONSTRAINT courses_price_check
                             CHECK (price >= 0)
);


-- ============================================================
-- ENROLLMENTS
-- ============================================================

CREATE TABLE enrollments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             student_id UUID NOT NULL
                                 REFERENCES students(id)
                                     ON DELETE CASCADE,

                             course_id UUID NOT NULL
                                 REFERENCES courses(id)
                                     ON DELETE CASCADE,

                             enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                             status VARCHAR(30) NOT NULL DEFAULT 'active',

                             CONSTRAINT enrollments_status_check
                                 CHECK (

