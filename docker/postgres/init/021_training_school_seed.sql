


-- ============================================================
-- 021_training_school_seed.sql
-- Заполнение sqltutor_training_school
-- ============================================================

\connect sqltutor_training_school


-- ============================================================
-- TEACHERS
-- ============================================================

INSERT INTO teachers (
    id,
    first_name,
    last_name,
    email,
    department,
    hired_at
)
VALUES
    (
        md5('teacher:1')::uuid,
        'John',
        'Anderson',
        'john.anderson@school.example',
        'Computer Science',
        NOW() - INTERVAL '5 years'
    ),
    (
        md5('teacher:2')::uuid,
        'Sarah',
        'Williams',
        'sarah.williams@school.example',
        'Mathematics',
        NOW() - INTERVAL '4 years'
    ),
    (
        md5('teacher:3')::uuid,
        'Michael',
        'Brown',
        'michael.brown@school.example',
        'Physics',
        NOW() - INTERVAL '6 years'
    ),
    (
        md5('teacher:4')::uuid,
        'Emma',
        'Davis',
        'emma.davis@school.example',
        'Computer Science',
        NOW() - INTERVAL '2 years'
    ),
    (
        md5('teacher:5')::uuid,
        'Daniel',
        'Miller',
        'daniel.miller@school.example',
        'Business',
        NOW() - INTERVAL '3 years'
    ),
    (
        md5('teacher:6')::uuid,
        'Olivia',
        'Wilson',
        'olivia.wilson@school.example',
        'Languages',
        NOW() - INTERVAL '7 years'
    ),
    (
        md5('teacher:7')::uuid,
        'James',
        'Taylor',
        'james.taylor@school.example',
        'Design',
        NOW() - INTERVAL '1 year'
    ),
    (
        md5('teacher:8')::uuid,
        'Sophia',
        'Moore',
        'sophia.moore@school.example',
        'History',
        NOW() - INTERVAL '8 years'
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STUDENTS
-- ============================================================

INSERT INTO students (
    id,
    first_name,
    last_name,

