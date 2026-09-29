-- ============================================================
-- 011_training_school.sql
-- Создание учебной базы данных sqltutor_training_school
-- ============================================================

CREATE DATABASE sqltutor_training_school OWNER sqltutor;

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
                                     status IN (
                                                'active',
                                                'completed',
                                                'dropped'
                                         )
                                     ),

                             CONSTRAINT enrollments_student_course_unique
                                 UNIQUE (student_id, course_id)
);


-- ============================================================
-- GRADES
-- ============================================================

CREATE TABLE grades (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                        enrollment_id UUID NOT NULL
                            REFERENCES enrollments(id)
                                ON DELETE CASCADE,

                        grade NUMERIC(5, 2) NOT NULL,

                        graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                        CONSTRAINT grades_value_check
                            CHECK (grade >= 0 AND grade <= 100)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_students_city
    ON students(city);

CREATE INDEX idx_students_enrolled_at
    ON students(enrolled_at);

CREATE INDEX idx_teachers_department
    ON teachers(department);

CREATE INDEX idx_courses_teacher_id
    ON courses(teacher_id);

CREATE INDEX idx_courses_department
    ON courses(department);

CREATE INDEX idx_enrollments_student_id
    ON enrollments(student_id);

CREATE INDEX idx_enrollments_course_id
    ON enrollments(course_id);

CREATE INDEX idx_enrollments_status
    ON enrollments(status);

CREATE INDEX idx_grades_enrollment_id
    ON grades(enrollment_id);

CREATE INDEX idx_grades_grade
    ON grades(grade);