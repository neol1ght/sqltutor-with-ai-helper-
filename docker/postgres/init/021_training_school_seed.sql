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
    email,
    birth_date,
    city,
    enrolled_at
)
SELECT
    md5('student:' || gs)::uuid,

    (
     ARRAY[
         'Alex',
     'Daniel',
     'Michael',
     'James',
     'Robert',
     'Thomas',
     'William',
     'David',
     'Emma',
     'Olivia',
     'Sophia',
     'Anna',
     'Laura',
     'Maria',
     'Emily',
     'Chloe',
     'Lucas',
     'Noah',
     'Liam',
     'Mia'
         ]
        )[1 + ((gs - 1) % 20)],

    (
        ARRAY[
            'Smith',
            'Johnson',
            'Williams',
            'Brown',
            'Jones',
            'Miller',
            'Davis',
            'Wilson',
            'Taylor',
            'Anderson',
            'Thomas',
            'Moore',
            'Martin',
            'Jackson',
            'White',
            'Harris',
            'Clark',
            'Lewis',
            'Walker',
            'Hall'
        ]
    )[1 + ((gs * 3 - 1) % 20)],

    'student' || gs || '@example.com',

    DATE '1998-01-01'
        + ((gs * 173) % 2500),

    (
        ARRAY[
            'Riga',
            'Tallinn',
            'Vilnius',
            'Berlin',
            'Warsaw',
            'Prague',
            'Helsinki',
            'Stockholm',
            'London',
            'Paris'
        ]
    )[1 + ((gs - 1) % 10)],

    NOW() - ((gs * 11) || ' days')::interval

FROM generate_series(1, 50) AS gs

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- COURSES
-- ============================================================

INSERT INTO courses (
    id,
    teacher_id,
    name,
    department,
    credits,
    price
)
VALUES
    (
        md5('course:1')::uuid,
        md5('teacher:1')::uuid,
        'SQL Fundamentals',
        'Computer Science',
        5,
        199.99
    ),
    (
        md5('course:2')::uuid,
        md5('teacher:1')::uuid,
        'Advanced PostgreSQL',
        'Computer Science',
        6,
        249.99
    ),
    (
        md5('course:3')::uuid,
        md5('teacher:1')::uuid,
        'Database Design',
        'Computer Science',
        5,
        219.99
    ),
    (
        md5('course:4')::uuid,
        md5('teacher:2')::uuid,
        'Linear Algebra',
        'Mathematics',
        6,
        179.99
    ),
    (
        md5('course:5')::uuid,
        md5('teacher:2')::uuid,
        'Calculus',
        'Mathematics',
        6,
        189.99
    ),
    (
        md5('course:6')::uuid,
        md5('teacher:3')::uuid,
        'Classical Mechanics',
        'Physics',
        5,
        199.99
    ),
    (
        md5('course:7')::uuid,
        md5('teacher:3')::uuid,
        'Electromagnetism',
        'Physics',
        6,
        229.99
    ),
    (
        md5('course:8')::uuid,
        md5('teacher:4')::uuid,
        'JavaScript Programming',
        'Computer Science',
        5,
        239.99
    ),
    (
        md5('course:9')::uuid,
        md5('teacher:4')::uuid,
        'Web Development',
        'Computer Science',
        6,
        259.99
    ),
    (
        md5('course:10')::uuid,
        md5('teacher:5')::uuid,
        'Business Analytics',
        'Business',
        5,
        209.99
    ),
    (
        md5('course:11')::uuid,
        md5('teacher:5')::uuid,
        'Marketing Basics',
        'Business',
        4,
        159.99
    ),
    (
        md5('course:12')::uuid,
        md5('teacher:6')::uuid,
        'English Communication',
        'Languages',
        4,
        149.99
    ),
    (
        md5('course:13')::uuid,
        md5('teacher:6')::uuid,
        'Academic Writing',
        'Languages',
        4,
        139.99
    ),
    (
        md5('course:14')::uuid,
        md5('teacher:7')::uuid,
        'UI/UX Design',
        'Design',
        5,
        229.99
    ),
    (
        md5('course:15')::uuid,
        md5('teacher:8')::uuid,
        'Modern History',
        'History',
        4,
        169.99
    ),

    -- Intentionally has no students.
    (
        md5('course:16')::uuid,
        md5('teacher:8')::uuid,
        'Ancient Civilizations',
        'History',
        5,
        189.99
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- ENROLLMENTS
-- ============================================================

INSERT INTO enrollments (
    id,
    student_id,
    course_id,
    enrolled_at,
    status
)
SELECT
    md5(
            'enrollment:' ||
            student_number ||
            ':' ||
            course_number
    )::uuid,

    md5(
            'student:' ||
            student_number
    )::uuid,

    md5(
            'course:' ||
            course_number
    )::uuid,

    NOW()
        - (
        ((student_number * 13 + course_number * 7) % 300)
    || ' days'
    )::interval,

     (
    ARRAY[
    'active',
    'completed',
    'dropped'
    ]
    )[
    1 + (
     (student_number + course_number) % 3
    )
    ]

FROM generate_series(1, 45) AS student_number

    CROSS JOIN LATERAL (
    SELECT
    1 + (
    (
    student_number * 3
    + course_offset * 5
    ) % 15
    ) AS course_number

    FROM generate_series(
    1,
    1 + (student_number % 5)
    ) AS course_offset
    ) AS selected_courses

WHERE course_number <> 16

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- GRADES
-- ============================================================

INSERT INTO grades (
    id,
    enrollment_id,
    grade,
    graded_at
)
SELECT
    md5(
            'grade:' ||
            e.id::text
    )::uuid,

    e.id,

    CASE
        WHEN e.status = 'dropped' THEN
            0

        ELSE
            50
                + (
                (
                    ABS(
                            ('x' || SUBSTRING(
                                    md5(e.id::text)
                                    FROM 1 FOR 8
                                    ))::bit(32)::int
                    ) % 51
                    )
                )
        END,

    e.enrolled_at
        + INTERVAL '30 days'

FROM enrollments e

WHERE e.status <> 'dropped'

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VALIDATION
-- ============================================================

SELECT 'teachers' AS table_name, COUNT(*) AS row_count
FROM teachers

UNION ALL

SELECT 'students', COUNT(*)
FROM students

UNION ALL

SELECT 'courses', COUNT(*)
FROM courses

UNION ALL

SELECT 'enrollments', COUNT(*)
FROM enrollments

UNION ALL

SELECT 'grades', COUNT(*)
FROM grades;