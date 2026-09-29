-- ============================================================
-- 030_app_seed.sql
-- Seed основной базы sqltutor
-- ============================================================

\connect sqltutor


-- ============================================================
-- LEARNING CASES
-- ============================================================

INSERT INTO learning_cases (
    id,
    title,
    slug,
    description,
    difficulty,
    database_name,
    is_published
)
VALUES
(
    md5('case:store')::uuid,
    'Online Store',
    'online-store',
    'Practice SQL using a realistic online store database with customers, products, orders and order items.',
    'EASY',
    'sqltutor_training_store',
    TRUE
),
(
    md5('case:school')::uuid,
    'University',
    'university',
    'Practice SQL using a university database with students, teachers, courses, enrollments and grades.',
    'EASY',
    'sqltutor_training_school',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- EXERCISES — ONLINE STORE
-- ============================================================

INSERT INTO exercises (
    id,
    case_id,
    title,
    description,
    difficulty,
    sort_order,
    is_published
)
VALUES
    (
        md5('exercise:store:1')::uuid,
        md5('case:store')::uuid,
        'List all products',
        'Write a query that returns all products from the products table.',
        'EASY',
        1,
        TRUE
    ),
    (
        md5('exercise:store:2')::uuid,
        md5('case:store')::uuid,
        'Find expensive products',
        'Find all products with a price greater than 500.',
        'EASY',
        2,
        TRUE
    ),
    (
        md5('exercise:store:3')::uuid,
        md5('case:store')::uuid,
        'Products sorted by price',
        'Return all products sorted by price from the most expensive to the cheapest.',
        'EASY',
        3,
        TRUE
    ),
    (
        md5('exercise:store:4')::uuid,
        md5('case:store')::uuid,
        'Count products',
        'Find the total number of products in the products table.',
        'EASY',
        4,
        TRUE
    ),
    (
        md5('exercise:store:5')::uuid,
        md5('case:store')::uuid,
        'Products by category',
        'Return the names and prices of products belonging to the Electronics category.',
        'MEDIUM',
        5,
        TRUE
    ),
    (
        md5('exercise:store:6')::uuid,
        md5('case:store')::uuid,
        'Customer order count',
        'For every customer, return their first name, last name and the number of orders they have placed.',
        'MEDIUM',
        6,
        TRUE
    ),
    (
        md5('exercise:store:7')::uuid,
        md5('case:store')::uuid,
        'Customers without orders',
        'Find all customers who have never placed an order.',
        'MEDIUM',
        7,
        TRUE
    ),
    (
        md5('exercise:store:8')::uuid,
        md5('case:store')::uuid,
        'Average order value',
        'Calculate the average order total.',
        'MEDIUM',
        8,
        TRUE
    ),
    (
        md5('exercise:store:9')::uuid,
        md5('case:store')::uuid,
        'Top customers by spending',
        'Find the five customers who have spent the most money.',
        'HARD',
        9,
        TRUE
    ),
    (
        md5('exercise:store:10')::uuid,
        md5('case:store')::uuid,
        'Best-selling products',
        'Find the products with the highest total quantity sold.',
        'HARD',
        10,
        TRUE
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- EXERCISES — UNIVERSITY
-- ============================================================

INSERT INTO exercises (
    id,
    case_id,
    title,
    description,
    difficulty,
    sort_order,
    is_published
)
VALUES
    (
        md5('exercise:school:1')::uuid,
        md5('case:school')::uuid,
        'List all students',
        'Return the first name, last name and city of every student.',
        'EASY',
        1,
        TRUE
    ),
    (
        md5('exercise:school:2')::uuid,
        md5('case:school')::uuid,
        'Students from Riga',
        'Find all students who live in Riga.',
        'EASY',
        2,
        TRUE
    ),
    (
        md5('exercise:school:3')::uuid,
        md5('case:school')::uuid,
        'Courses by price',
        'Return all courses sorted from the most expensive to the cheapest.',
        'EASY',
        3,
        TRUE
    ),
    (
        md5('exercise:school:4')::uuid,
        md5('case:school')::uuid,
        'Count students',
        'Find the total number of students.',
        'EASY',
        4,
        TRUE
    ),
    (
        md5('exercise:school:5')::uuid,
        md5('case:school')::uuid,
        'Students per course',
        'For every course, return its name and the number of enrolled students.',
        'MEDIUM',
        5,
        TRUE
    ),
    (
        md5('exercise:school:6')::uuid,
        md5('case:school')::uuid,
        'Courses without students',
        'Find all courses that currently have no enrolled students.',
        'MEDIUM',
        6,
        TRUE
    ),
    (
        md5('exercise:school:7')::uuid,
        md5('case:school')::uuid,
        'Average grade',
        'Calculate the average grade for every course.',
        'MEDIUM',
        7,
        TRUE
    ),
    (
        md5('exercise:school:8')::uuid,
        md5('case:school')::uuid,
        'Students with multiple courses',
        'Find students who are enrolled in at least three courses.',
        'MEDIUM',
        8,
        TRUE
    ),
    (
        md5('exercise:school:9')::uuid,
        md5('case:school')::uuid,
        'Best students',
        'Find students whose average grade is greater than 85.',
        'HARD',
        9,
        TRUE
    ),
    (
        md5('exercise:school:10')::uuid,
        md5('case:school')::uuid,
        'Best performing courses',
        'Find courses whose average grade is above the average grade across all courses.',
        'HARD',
        10,
        TRUE
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SOLUTIONS — ONLINE STORE
-- ============================================================

INSERT INTO exercise_solutions (
    id,
    exercise_id,
    query
)
VALUES
    (
        md5('solution:store:1')::uuid,
        md5('exercise:store:1')::uuid,
        'SELECT * FROM products;'
    ),
    (
        md5('solution:store:2')::uuid,
        md5('exercise:store:2')::uuid,
        'SELECT * FROM products WHERE price > 500;'
    ),
    (
        md5('solution:store:3')::uuid,
        md5('exercise:store:3')::uuid,
        'SELECT * FROM products ORDER BY price DESC;'
    ),
    (
        md5('solution:store:4')::uuid,
        md5('exercise:store:4')::uuid,
        'SELECT COUNT(*) FROM products;'
    ),
    (
        md5('solution:store:5')::uuid,
        md5('exercise:store:5')::uuid,
        'SELECT p.name, p.price
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE c.name = ''Electronics'';'
    ),
    (
        md5('solution:store:6')::uuid,
        md5('exercise:store:6')::uuid,
        'SELECT
             c.first_name,
             c.last_name,
             COUNT(o.id) AS orders_count
         FROM customers c
         LEFT JOIN orders o
             ON o.customer_id = c.id
         GROUP BY c.id, c.first_name, c.last_name;'
    ),
    (
        md5('solution:store:7')::uuid,
        md5('exercise:store:7')::uuid,
        'SELECT
             c.first_name,
             c.last_name,
             c.email
         FROM customers c
         LEFT JOIN orders o
             ON o.customer_id = c.id
         WHERE o.id IS NULL;'
    ),
    (
        md5('solution:store:8')::uuid,
        md5('exercise:store:8')::uuid,
        'SELECT AVG(total_amount) AS average_order_value
         FROM orders;'
    ),
    (
        md5('solution:store:9')::uuid,
        md5('exercise:store:9')::uuid,
        'SELECT
             c.first_name,
             c.last_name,
             SUM(o.total_amount) AS total_spent
         FROM customers c
         JOIN orders o
             ON o.customer_id = c.id
         GROUP BY c.id, c.first_name, c.last_name
         ORDER BY total_spent DESC
         LIMIT 5;'
    ),
    (
        md5('solution:store:10')::uuid,
        md5('exercise:store:10')::uuid,
        'SELECT
             p.name,
             SUM(oi.quantity) AS quantity_sold
         FROM products p
         JOIN order_items oi
             ON oi.product_id = p.id
         GROUP BY p.id, p.name
         ORDER BY quantity_sold DESC;'
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SOLUTIONS — UNIVERSITY
-- ============================================================

INSERT INTO exercise_solutions (
    id,
    exercise_id,
    query
)
VALUES
    (
        md5('solution:school:1')::uuid,
        md5('exercise:school:1')::uuid,
        'SELECT first_name, last_name, city
         FROM students;'
    ),
    (
        md5('solution:school:2')::uuid,
        md5('exercise:school:2')::uuid,
        'SELECT *
         FROM students
         WHERE city = ''Riga'';'
    ),
    (
        md5('solution:school:3')::uuid,
        md5('exercise:school:3')::uuid,
        'SELECT *
         FROM courses
         ORDER BY price DESC;'
    ),
    (
        md5('solution:school:4')::uuid,
        md5('exercise:school:4')::uuid,
        'SELECT COUNT(*)
         FROM students;'
    ),
    (
        md5('solution:school:5')::uuid,
        md5('exercise:school:5')::uuid,
        'SELECT
             c.name,
             COUNT(e.id) AS students_count
         FROM courses c
         LEFT JOIN enrollments e
             ON e.course_id = c.id
         GROUP BY c.id, c.name;'
    ),
    (
        md5('solution:school:6')::uuid,
        md5('exercise:school:6')::uuid,
        'SELECT c.name
         FROM courses c
         LEFT JOIN enrollments e
             ON e.course_id = c.id
         WHERE e.id IS NULL;'
    ),
    (
        md5('solution:school:7')::uuid,
        md5('exercise:school:7')::uuid,
        'SELECT
             c.name,
             AVG(g.grade) AS average_grade
         FROM courses c
         JOIN enrollments e
             ON e.course_id = c.id
         JOIN grades g
             ON g.enrollment_id = e.id
         GROUP BY c.id, c.name;'
    ),
    (
        md5('solution:school:8')::uuid,
        md5('exercise:school:8')::uuid,
        'SELECT
             s.first_name,
             s.last_name,
             COUNT(e.id) AS courses_count
         FROM students s
         JOIN enrollments e
             ON e.student_id = s.id
         GROUP BY s.id, s.first_name, s.last_name
         HAVING COUNT(e.id) >= 3;'
    ),
    (
        md5('solution:school:9')::uuid,
        md5('exercise:school:9')::uuid,
        'SELECT
             s.first_name,
             s.last_name,
             AVG(g.grade) AS average_grade
         FROM students s
         JOIN enrollments e
             ON e.student_id = s.id
         JOIN grades g
             ON g.enrollment_id = e.id
         GROUP BY s.id, s.first_name, s.last_name
         HAVING AVG(g.grade) > 85;'
    ),
    (
        md5('solution:school:10')::uuid,
        md5('exercise:school:10')::uuid,
        'WITH course_averages AS (
             SELECT
                 c.id,
                 c.name,
                 AVG(g.grade) AS average_grade
             FROM courses c
             JOIN enrollments e
                 ON e.course_id = c.id
             JOIN grades g
                 ON g.enrollment_id = e.id
             GROUP BY c.id, c.name
         )
         SELECT
             id,
             name,
             average_grade
         FROM course_averages
         WHERE average_grade > (
             SELECT AVG(grade)
             FROM grades
         );'
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- HINTS — ONLINE STORE
-- ============================================================

INSERT INTO exercise_hints (
    id,
    exercise_id,
    level,
    content
)
VALUES
    (
        md5('hint:store:1:1')::uuid,
        md5('exercise:store:1')::uuid,
        1,
        'The data you need is stored in the products table.'
    ),
    (
        md5('hint:store:2:1')::uuid,
        md5('exercise:store:2')::uuid,
        1,
        'Use WHERE to filter products by their price.'
    ),
    (
        md5('hint:store:3:1')::uuid,
        md5('exercise:store:3')::uuid,
        1,
        'ORDER BY can sort the result. DESC gives descending order.'
    ),
    (
        md5('hint:store:5:1')::uuid,
        md5('exercise:store:5')::uuid,
        1,
        'Products contain category_id. Categories contain the category name.'
    ),
    (
        md5('hint:store:6:1')::uuid,
        md5('exercise:store:6')::uuid,
        1,
        'You need to connect customers with orders using customer_id.'
    ),
    (
        md5('hint:store:7:1')::uuid,
        md5('exercise:store:7')::uuid,
        1,
        'Think about what happens when LEFT JOIN finds no matching order.'
    ),
    (
        md5('hint:store:9:1')::uuid,
        md5('exercise:store:9')::uuid,
        1,
        'First calculate the total amount spent by each customer.'
    ),
    (
        md5('hint:store:9:2')::uuid,
        md5('exercise:store:9')::uuid,
        2,
        'GROUP BY the customer, calculate SUM(total_amount), then sort descending and use LIMIT.'
    ),
    (
        md5('hint:store:10:1')::uuid,
        md5('exercise:store:10')::uuid,
        1,
        'The quantity sold is stored in order_items.'
    ),
    (
        md5('hint:store:10:2')::uuid,
        md5('exercise:store:10')::uuid,
        2,
        'Join products with order_items and SUM the quantity for each product.'
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- HINTS — UNIVERSITY
-- ============================================================

INSERT INTO exercise_hints (
    id,
    exercise_id,
    level,
    content
)
VALUES
    (
        md5('hint:school:1:1')::uuid,
        md5('exercise:school:1')::uuid,
        1,
        'The student information is stored in the students table.'
    ),
    (
        md5('hint:school:2:1')::uuid,
        md5('exercise:school:2')::uuid,
        1,
        'The city is stored in the students table.'
    ),
    (
        md5('hint:school:5:1')::uuid,
        md5('exercise:school:5')::uuid,
        1,
        'Students and courses are connected through enrollments.'
    ),
    (
        md5('hint:school:5:2')::uuid,
        md5('exercise:school:5')::uuid,
        2,
        'Use LEFT JOIN and COUNT to keep courses that have zero students.'
    ),
    (
        md5('hint:school:6:1')::uuid,
        md5('exercise:school:6')::uuid,
        1,
        'Start with courses and LEFT JOIN enrollments.'
    ),
    (
        md5('hint:school:6:2')::uuid,
        md5('exercise:school:6')::uuid,
        2,
        'Courses without students will have NULL in the enrollment columns.'
    ),
    (
        md5('hint:school:7:1')::uuid,
        md5('exercise:school:7')::uuid,
        1,
        'Grades are connected to courses through enrollments.'
    ),
    (
        md5('hint:school:8:1')::uuid,
        md5('exercise:school:8')::uuid,
        1,
        'Count enrollments for every student.'
    ),
    (
        md5('hint:school:8:2')::uuid,
        md5('exercise:school:8')::uuid,
        2,
        'HAVING allows you to filter grouped results.'
    ),
    (
        md5('hint:school:9:1')::uuid,
        md5('exercise:school:9')::uuid,
        1,
        'Calculate AVG(grade) for every student.'
    ),
    (
        md5('hint:school:9:2')::uuid,
        md5('exercise:school:9')::uuid,
        2,
        'Use HAVING to keep only students with an average above 85.'
    ),
    (
        md5('hint:school:10:1')::uuid,
        md5('exercise:school:10')::uuid,
        1,
        'First calculate the average grade for each course.'
    ),
    (
        md5('hint:school:10:2')::uuid,
        md5('exercise:school:10')::uuid,
        2,
        'Then compare every course average with the overall average grade.'
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

INSERT INTO achievements (
    id,
    code,
    title,
    description,
    icon
)
VALUES
    (
        md5('achievement:first-solve')::uuid,
        'FIRST_SOLVE',
        'First Steps',
        'Solve your first SQL exercise.',
        'target'
    ),
    (
        md5('achievement:ten-solves')::uuid,
        'TEN_SOLVES',
        'SQL Apprentice',
        'Solve 10 SQL exercises.',
        'book-open'
    ),
    (
        md5('achievement:twenty-five-solves')::uuid,
        'TWENTY_FIVE_SOLVES',
        'SQL Explorer',
        'Solve 25 SQL exercises.',
        'database'
    ),
    (
        md5('achievement:hard-solve')::uuid,
        'HARD_SOLVE',
        'Query Master',
        'Solve a hard SQL exercise.',
        'trophy'
    )
    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VALIDATION
-- ============================================================

SELECT
    'learning_cases' AS table_name,
    COUNT(*) AS row_count
FROM learning_cases

UNION ALL

SELECT
    'exercises',
    COUNT(*)
FROM exercises

UNION ALL

SELECT
    'exercise_solutions',
    COUNT(*)
FROM exercise_solutions

UNION ALL

SELECT
    'exercise_hints',
    COUNT(*)
FROM exercise_hints

UNION ALL

SELECT
    'achievements',
    COUNT(*)
FROM achievements;