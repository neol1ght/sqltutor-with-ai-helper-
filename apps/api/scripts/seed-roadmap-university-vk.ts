import { PrismaClient, exercise_difficulty, learning_node_type } from '@prisma/client';

const prisma = new PrismaClient();

const vkTasks = [
  {
    "title": "Аналитика активности пользователей",
    "description": "Найдите 10 пользователей с наибольшим количеством публичных постов, исключая удалённые записи. Выведите пользователя и число постов.",
    "difficulty": "MEDIUM",
    "solution": "SELECT u.id, u.username, COUNT(p.id) AS posts_count FROM users u JOIN posts p ON p.author_id = u.id WHERE p.deleted_at IS NULL AND p.visibility = 'PUBLIC' GROUP BY u.id, u.username ORDER BY posts_count DESC, u.username LIMIT 10;",
    "hints": [
      "Сначала соедините users и posts по author_id.",
      "Отфильтруйте неудалённые публичные посты, сгруппируйте по пользователю и отсортируйте по COUNT."
    ]
  },
  {
    "title": "Самые активные сообщества",
    "description": "Для каждого сообщества посчитайте количество участников и неудалённых постов. Оставьте сообщества минимум с 5 участниками.",
    "difficulty": "MEDIUM",
    "solution": "SELECT c.id, c.name, COUNT(DISTINCT cm.user_id) AS members_count, COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS posts_count FROM communities c LEFT JOIN community_members cm ON cm.community_id = c.id LEFT JOIN posts p ON p.community_id = c.id GROUP BY c.id, c.name HAVING COUNT(DISTINCT cm.user_id) >= 5 ORDER BY members_count DESC, posts_count DESC;",
    "hints": [
      "Нужны LEFT JOIN, чтобы не терять сообщества без постов.",
      "При соединении двух таблиц «один-ко-многим» используйте COUNT(DISTINCT ...) и HAVING для фильтра по агрегату."
    ]
  },
  {
    "title": "Конверсия заявок в дружбу",
    "description": "Посчитайте по каждому пользователю число отправленных заявок, принятых заявок и долю принятых заявок в процентах.",
    "difficulty": "MEDIUM",
    "solution": "SELECT u.id, u.username, COUNT(f.requester_id) AS sent_requests, COUNT(f.requester_id) FILTER (WHERE f.status = 'ACCEPTED') AS accepted_requests, ROUND(100.0 * COUNT(f.requester_id) FILTER (WHERE f.status = 'ACCEPTED') / NULLIF(COUNT(f.requester_id), 0), 2) AS accepted_percent FROM users u LEFT JOIN friendships f ON f.requester_id = u.id GROUP BY u.id, u.username HAVING COUNT(f.requester_id) > 0 ORDER BY accepted_percent DESC;",
    "hints": [
      "Сгруппируйте заявки по requester_id.",
      "Используйте FILTER для подсчёта только ACCEPTED и NULLIF, чтобы избежать деления на ноль."
    ]
  },
  {
    "title": "Посты с вовлечённостью выше средней",
    "description": "Найдите посты, у которых сумма реакций и комментариев выше среднего значения по всем неудалённым постам.",
    "difficulty": "HARD",
    "solution": "WITH engagement AS (SELECT p.id, p.author_id, p.text, COUNT(DISTINCT r.id) AS reactions_count, COUNT(DISTINCT c.id) AS comments_count FROM posts p LEFT JOIN reactions r ON r.post_id = p.id LEFT JOIN comments c ON c.post_id = p.id AND c.deleted_at IS NULL WHERE p.deleted_at IS NULL GROUP BY p.id, p.author_id, p.text), scored AS (SELECT *, reactions_count + comments_count AS engagement FROM engagement) SELECT id, author_id, reactions_count, comments_count, engagement FROM scored WHERE engagement > (SELECT AVG(engagement) FROM scored) ORDER BY engagement DESC;",
    "hints": [
      "Посчитайте реакции и комментарии отдельно на уровне каждого поста.",
      "В CTE сформируйте engagement = reactions_count + comments_count, затем сравните с AVG по этому набору."
    ]
  },
  {
    "title": "Рейтинг пользователей по реакциям",
    "description": "Ранжируйте авторов по общему числу реакций на их неудалённые посты. Покажите место, имя пользователя и число реакций.",
    "difficulty": "HARD",
    "solution": "WITH totals AS (SELECT u.id, u.username, COUNT(r.id) AS reactions_count FROM users u LEFT JOIN posts p ON p.author_id = u.id AND p.deleted_at IS NULL LEFT JOIN reactions r ON r.post_id = p.id GROUP BY u.id, u.username) SELECT id, username, reactions_count, DENSE_RANK() OVER (ORDER BY reactions_count DESC) AS rating FROM totals ORDER BY rating, username;",
    "hints": [
      "Сначала агрегируйте реакции на уровне пользователя.",
      "Примените DENSE_RANK() OVER (ORDER BY reactions_count DESC) к результату агрегации."
    ]
  },
  {
    "title": "Пользователи без активности за 30 дней",
    "description": "Найдите активных пользователей, которые не публиковали посты и не отправляли сообщения за последние 30 дней.",
    "difficulty": "HARD",
    "solution": "SELECT u.id, u.username FROM users u WHERE u.status = 'ACTIVE' AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.author_id = u.id AND p.deleted_at IS NULL AND p.created_at >= NOW() - INTERVAL '30 days') AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.sender_id = u.id AND m.deleted_at IS NULL AND m.sent_at >= NOW() - INTERVAL '30 days') ORDER BY u.username;",
    "hints": [
      "Проверку отсутствия записей удобно выразить через NOT EXISTS.",
      "Сделайте два независимых NOT EXISTS: для posts и messages, с одинаковой временной границей."
    ]
  },
  {
    "title": "Популярные хештеги по месяцам",
    "description": "Для каждого месяца и хештега посчитайте количество связанных постов, оставив пары с минимум тремя постами.",
    "difficulty": "HARD",
    "solution": "SELECT date_trunc('month', p.created_at)::date AS month, h.tag, COUNT(DISTINCT p.id) AS posts_count FROM hashtags h JOIN post_hashtags ph ON ph.hashtag_id = h.id JOIN posts p ON p.id = ph.post_id WHERE p.deleted_at IS NULL GROUP BY date_trunc('month', p.created_at)::date, h.tag HAVING COUNT(DISTINCT p.id) >= 3 ORDER BY month DESC, posts_count DESC, h.tag;",
    "hints": [
      "Связь проходит через post_hashtags между hashtags и posts.",
      "Группируйте по date_trunc('month', created_at) и тегу; условие по количеству задайте в HAVING."
    ]
  },
  {
    "title": "Последний пост каждого сообщества",
    "description": "Выведите самый свежий неудалённый пост каждого сообщества. Сообщества без постов в результат не включайте.",
    "difficulty": "HARD",
    "solution": "WITH ranked AS (SELECT c.id AS community_id, c.name, p.id AS post_id, p.text, p.created_at, ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY p.created_at DESC, p.id DESC) AS rn FROM communities c JOIN posts p ON p.community_id = c.id WHERE p.deleted_at IS NULL) SELECT community_id, name, post_id, text, created_at FROM ranked WHERE rn = 1 ORDER BY created_at DESC;",
    "hints": [
      "Объедините communities и posts, отфильтровав удалённые записи.",
      "ROW_NUMBER() с PARTITION BY community_id и сортировкой по дате в обратном порядке позволит выбрать rn = 1."
    ]
  },
  {
    "title": "Доля приватных профилей по городам",
    "description": "Для каждого города посчитайте число пользователей и процент приватных профилей.",
    "difficulty": "MEDIUM",
    "solution": "SELECT city, COUNT(*) AS users_count, ROUND(100.0 * COUNT(*) FILTER (WHERE is_private) / NULLIF(COUNT(*), 0), 2) AS private_percent FROM users GROUP BY city ORDER BY private_percent DESC, users_count DESC;",
    "hints": [
      "Сгруппируйте users по city.",
      "Условный COUNT через FILTER и деление на общее число пользователей дадут процент."
    ]
  },
  {
    "title": "Сообщения выше среднего по диалогам",
    "description": "Найдите диалоги, где количество неудалённых сообщений выше среднего количества сообщений на диалог.",
    "difficulty": "HARD",
    "solution": "WITH counts AS (SELECT c.id, c.title, c.conversation_type, COUNT(m.id) FILTER (WHERE m.deleted_at IS NULL) AS messages_count FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id GROUP BY c.id, c.title, c.conversation_type) SELECT id, title, conversation_type, messages_count FROM counts WHERE messages_count > (SELECT AVG(messages_count) FROM counts) ORDER BY messages_count DESC;",
    "hints": [
      "Сначала посчитайте сообщения каждого диалога, включая диалоги без сообщений.",
      "Сравните messages_count со скалярным подзапросом, вычисляющим AVG из CTE."
    ]
  },
  {
    "title": "Повторные собеседники",
    "description": "Найдите пары пользователей, которые участвовали вместе более чем в одном диалоге. Каждую пару выведите один раз.",
    "difficulty": "HARD",
    "solution": "SELECT cm1.user_id AS user_1, cm2.user_id AS user_2, COUNT(DISTINCT cm1.conversation_id) AS shared_conversations FROM conversation_members cm1 JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id AND cm1.user_id < cm2.user_id GROUP BY cm1.user_id, cm2.user_id HAVING COUNT(DISTINCT cm1.conversation_id) > 1 ORDER BY shared_conversations DESC, user_1, user_2;",
    "hints": [
      "Соедините conversation_members с самой собой по conversation_id.",
      "Условие user_id < user_id_второй_строки уберёт дубликаты и пары пользователя с самим собой."
    ]
  },
  {
    "title": "Время ответа в диалогах",
    "description": "Для каждого отправителя вычислите средний интервал в минутах между его сообщением и предыдущим сообщением в том же диалоге.",
    "difficulty": "HARD",
    "solution": "WITH ordered AS (SELECT conversation_id, sender_id, sent_at, LAG(sent_at) OVER (PARTITION BY conversation_id ORDER BY sent_at, id) AS previous_sent_at FROM messages WHERE deleted_at IS NULL) SELECT sender_id, ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - previous_sent_at)) / 60.0)::numeric, 2) AS avg_reply_minutes, COUNT(*) FILTER (WHERE previous_sent_at IS NOT NULL) AS measured_messages FROM ordered GROUP BY sender_id HAVING COUNT(*) FILTER (WHERE previous_sent_at IS NOT NULL) > 0 ORDER BY avg_reply_minutes;",
    "hints": [
      "LAG() позволяет получить время предыдущего сообщения внутри диалога.",
      "Посчитайте разницу timestamp через EXTRACT(EPOCH FROM (...)) / 60 и усредните по sender_id."
    ]
  },
  {
    "title": "Участники, не вступившие в сообщества",
    "description": "Найдите пользователей, которые не состоят ни в одном сообществе, но имеют хотя бы один неудалённый пост.",
    "difficulty": "MEDIUM",
    "solution": "SELECT u.id, u.username FROM users u WHERE EXISTS (SELECT 1 FROM posts p WHERE p.author_id = u.id AND p.deleted_at IS NULL) AND NOT EXISTS (SELECT 1 FROM community_members cm WHERE cm.user_id = u.id) ORDER BY u.username;",
    "hints": [
      "Потребуются EXISTS и NOT EXISTS.",
      "Проверьте наличие хотя бы одного поста и отсутствие строк в community_members."
    ]
  },
  {
    "title": "Активность по дням недели",
    "description": "Посчитайте число неудалённых постов по дням недели и определите долю каждого дня от общего числа постов в процентах.",
    "difficulty": "HARD",
    "solution": "WITH daily AS (SELECT EXTRACT(ISODOW FROM created_at)::int AS weekday, COUNT(*) AS posts_count FROM posts WHERE deleted_at IS NULL GROUP BY EXTRACT(ISODOW FROM created_at)::int) SELECT weekday, posts_count, ROUND(100.0 * posts_count / NULLIF(SUM(posts_count) OVER (), 0), 2) AS percent_of_posts FROM daily ORDER BY weekday;",
    "hints": [
      "Сгруппируйте записи по EXTRACT(ISODOW FROM created_at).",
      "Оконная SUM(posts_count) OVER () даст общий итог без дополнительного соединения."
    ]
  },
  {
    "title": "Сообщества с высоким процентом верифицированных участников",
    "description": "Найдите сообщества минимум с пятью участниками и выведите процент верифицированных участников.",
    "difficulty": "HARD",
    "solution": "SELECT c.id, c.name, COUNT(*) AS members_count, ROUND(100.0 * COUNT(*) FILTER (WHERE u.is_verified) / NULLIF(COUNT(*), 0), 2) AS verified_percent FROM communities c JOIN community_members cm ON cm.community_id = c.id JOIN users u ON u.id = cm.user_id GROUP BY c.id, c.name HAVING COUNT(*) >= 5 ORDER BY verified_percent DESC, members_count DESC;",
    "hints": [
      "Соедините сообщества, участников и пользователей.",
      "Условный COUNT с FILTER считает verified-профили, а HAVING ограничивает минимальный размер сообщества."
    ]
  },
  {
    "title": "Последняя сессия каждого пользователя",
    "description": "Для каждого пользователя выведите его последнюю сессию, устройство и дату начала. Пользователей без сессий исключите.",
    "difficulty": "HARD",
    "solution": "WITH ranked AS (SELECT us.user_id, us.device_name, us.started_at, us.ended_at, ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.started_at DESC, us.id DESC) AS rn FROM user_sessions us) SELECT user_id, device_name, started_at, ended_at FROM ranked WHERE rn = 1 ORDER BY started_at DESC;",
    "hints": [
      "Ранжируйте сессии внутри user_id по started_at от новых к старым.",
      "Оставьте строку с ROW_NUMBER() = 1."
    ]
  },
  {
    "title": "Взаимные принятые дружбы",
    "description": "Найдите пары пользователей, у которых заявки приняты в обоих направлениях. Выведите пару один раз.",
    "difficulty": "HARD",
    "solution": "SELECT f1.requester_id AS user_1, f1.addressee_id AS user_2 FROM friendships f1 JOIN friendships f2 ON f2.requester_id = f1.addressee_id AND f2.addressee_id = f1.requester_id WHERE f1.status = 'ACCEPTED' AND f2.status = 'ACCEPTED' AND f1.requester_id < f1.addressee_id ORDER BY user_1, user_2;",
    "hints": [
      "Нужно соединить friendships с самой собой, поменяв requester_id и addressee_id местами.",
      "Обе записи должны иметь статус ACCEPTED; условие requester_id < addressee_id убирает зеркальные дубликаты."
    ]
  },
  {
    "title": "Посты с реакциями разных типов",
    "description": "Найдите неудалённые посты, получившие не менее четырёх разных типов реакций.",
    "difficulty": "MEDIUM",
    "solution": "SELECT p.id, p.author_id, COUNT(r.id) AS reactions_count, COUNT(DISTINCT r.reaction_type) AS reaction_types FROM posts p JOIN reactions r ON r.post_id = p.id WHERE p.deleted_at IS NULL GROUP BY p.id, p.author_id HAVING COUNT(DISTINCT r.reaction_type) >= 4 ORDER BY reaction_types DESC, reactions_count DESC;",
    "hints": [
      "Соедините posts и reactions, затем сгруппируйте по посту.",
      "Используйте COUNT(DISTINCT reaction_type) в HAVING."
    ]
  },
  {
    "title": "Комплексный рейтинг авторов",
    "description": "Для каждого автора посчитайте неудалённые посты, реакции и комментарии к его постам. Рассчитайте рейтинг: посты + реакции * 2 + комментарии * 3.",
    "difficulty": "HARD",
    "solution": "WITH post_stats AS (SELECT u.id, u.username, COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS posts_count, COUNT(DISTINCT r.id) AS reactions_count, COUNT(DISTINCT c.id) FILTER (WHERE c.deleted_at IS NULL) AS comments_count FROM users u LEFT JOIN posts p ON p.author_id = u.id AND p.deleted_at IS NULL LEFT JOIN reactions r ON r.post_id = p.id LEFT JOIN comments c ON c.post_id = p.id GROUP BY u.id, u.username) SELECT id, username, posts_count, reactions_count, comments_count, posts_count + reactions_count * 2 + comments_count * 3 AS score, DENSE_RANK() OVER (ORDER BY posts_count + reactions_count * 2 + comments_count * 3 DESC) AS rank FROM post_stats ORDER BY rank, username;",
    "hints": [
      "Соберите агрегаты по автору через LEFT JOIN, считая DISTINCT для защиты от размножения строк.",
      "Рассчитайте score из трёх агрегатов и примените DENSE_RANK по убыванию score."
    ]
  },
  {
    "title": "Цепочка рекомендаций через друзей",
    "description": "Для каждого пользователя найдите пользователей второго уровня: они являются друзьями его друзей, но не являются его прямыми принятыми друзьями. Выведите пары без повторов.",
    "difficulty": "HARD",
    "solution": "WITH accepted_edges AS (SELECT requester_id AS user_id, addressee_id AS friend_id FROM friendships WHERE status = 'ACCEPTED' UNION SELECT addressee_id, requester_id FROM friendships WHERE status = 'ACCEPTED') SELECT DISTINCT e1.user_id, e2.friend_id AS suggested_user_id FROM accepted_edges e1 JOIN accepted_edges e2 ON e2.user_id = e1.friend_id WHERE e2.friend_id <> e1.user_id AND NOT EXISTS (SELECT 1 FROM accepted_edges direct WHERE direct.user_id = e1.user_id AND direct.friend_id = e2.friend_id) ORDER BY e1.user_id, suggested_user_id;",
    "hints": [
      "Сначала представьте принятую дружбу как двунаправленную связь через CTE.",
      "Соедините эту связь саму с собой по другу первого пользователя; исключите самого пользователя и прямых друзей через NOT EXISTS."
    ]
  }
];

const universityLectures = [
  {
    "slug": "university-joins-and-aggregation",
    "title": "JOIN и агрегатные функции",
    "summary": "Связываем таблицы University и анализируем данные с помощью группировок.",
    "minutes": 15,
    "content": {
      "blocks": [
        {
          "type": "heading",
          "text": "Зачем нужны JOIN"
        },
        {
          "type": "paragraph",
          "text": "В учебной базе данные распределены по связанным таблицам. Например, enrollments связывает студентов и курсы, а grades хранит оценку по записи на курс. JOIN позволяет собрать эти данные в одном результате."
        },
        {
          "type": "code",
          "language": "sql",
          "code": "SELECT s.first_name, s.last_name, c.name AS course_name, e.status\nFROM students s\nJOIN enrollments e ON e.student_id = s.id\nJOIN courses c ON c.id = e.course_id;"
        },
        {
          "type": "heading",
          "text": "Агрегация"
        },
        {
          "type": "paragraph",
          "text": "GROUP BY объединяет строки в группы, а COUNT, AVG, MIN и MAX вычисляют показатели для каждой группы. Условия по агрегатам задаются через HAVING, а не WHERE."
        },
        {
          "type": "code",
          "language": "sql",
          "code": "SELECT c.name, COUNT(e.id) AS enrollments_count, ROUND(AVG(g.grade), 2) AS avg_grade\nFROM courses c\nLEFT JOIN enrollments e ON e.course_id = c.id\nLEFT JOIN grades g ON g.enrollment_id = e.id\nGROUP BY c.id, c.name\nORDER BY enrollments_count DESC;"
        }
      ]
    }
  },
  {
    "slug": "university-subqueries-and-cte",
    "title": "Подзапросы и CTE",
    "summary": "Разбиваем сложные запросы на логические шаги и сравниваем показатели с общими значениями.",
    "minutes": 15,
    "content": {
      "blocks": [
        {
          "type": "heading",
          "text": "Подзапросы"
        },
        {
          "type": "paragraph",
          "text": "Подзапрос можно использовать в WHERE, FROM или SELECT. Например, можно выбрать курсы, цена которых выше средней цены всех курсов."
        },
        {
          "type": "code",
          "language": "sql",
          "code": "SELECT name, price\nFROM courses\nWHERE price > (SELECT AVG(price) FROM courses)\nORDER BY price DESC;"
        },
        {
          "type": "heading",
          "text": "CTE через WITH"
        },
        {
          "type": "paragraph",
          "text": "CTE создаёт именованный промежуточный результат. Это помогает разделять расчёт агрегатов и последующую фильтрацию, делая запрос понятнее."
        },
        {
          "type": "code",
          "language": "sql",
          "code": "WITH course_stats AS (\n  SELECT c.id, c.name, COUNT(e.id) AS enrollment_count\n  FROM courses c\n  LEFT JOIN enrollments e ON e.course_id = c.id\n  GROUP BY c.id, c.name\n)\nSELECT *\nFROM course_stats\nWHERE enrollment_count >= 5\nORDER BY enrollment_count DESC;"
        }
      ]
    }
  },
  {
    "slug": "university-window-functions",
    "title": "Оконные функции и аналитика",
    "summary": "Ранжируем курсы, сравниваем оценки и вычисляем показатели без потери строк.",
    "minutes": 18,
    "content": {
      "blocks": [
        {
          "type": "heading",
          "text": "Чем оконные функции отличаются от GROUP BY"
        },
        {
          "type": "paragraph",
          "text": "GROUP BY сворачивает строки в группы. Оконная функция вычисляет показатель по набору связанных строк, но сохраняет каждую строку результата."
        },
        {
          "type": "code",
          "language": "sql",
          "code": "SELECT c.name, e.student_id, g.grade,\n       RANK() OVER (PARTITION BY e.course_id ORDER BY g.grade DESC) AS grade_rank\nFROM enrollments e\nJOIN courses c ON c.id = e.course_id\nJOIN grades g ON g.enrollment_id = e.id\nORDER BY c.name, grade_rank;"
        },
        {
          "type": "heading",
          "text": "Типичный сценарий"
        },
        {
          "type": "paragraph",
          "text": "Используйте PARTITION BY, чтобы начинать ранжирование заново для каждого курса, а ORDER BY внутри OVER — чтобы определить порядок строк. Для предыдущего значения применяются LAG, для следующего — LEAD."
        }
      ]
    }
  }
];

async function main() {
  const cases = await prisma.learningCase.findMany({
    include: {
      exercises: { orderBy: { sortOrder: 'asc' } },
      learningPathNodes: {
        include: { lecture: true, exercise: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  const university = cases.find((c) =>
    /university|training[_-]?school/i.test(`${c.title} ${c.slug} ${c.databaseName}`),
  );
  const vk = cases.find((c) =>
    /vk[_-]?base|vkontakte|социальн/i.test(`${c.title} ${c.slug} ${c.databaseName}`),
  );

  if (!university) {
    throw new Error('Не найден LearningCase для University. Проверь title/slug/databaseName в learning_cases.');
  }
  if (!vk) {
    throw new Error('Не найден LearningCase для VK Base. Проверь title/slug/databaseName в learning_cases.');
  }
  if (university.id === vk.id) {
    throw new Error('University и VK Base разрешились в одну учебную базу. Остановлено во избежание изменений не того курса.');
  }

  await prisma.$transaction(async (tx) => {
    // University: добавляем три новые лекции; уже существующие лекции и 13 заданий не удаляем.
    const lectureRecords = [];
    for (const item of universityLectures) {
      const lecture = await tx.lecture.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content,
          estimatedMinutes: item.minutes,
          difficulty: exercise_difficulty.MEDIUM,
          isPublished: true,
        },
        create: {
          slug: item.slug,
          title: item.title,
          summary: item.summary,
          content: item.content,
          estimatedMinutes: item.minutes,
          difficulty: exercise_difficulty.MEDIUM,
          isPublished: true,
        },
      });
      lectureRecords.push(lecture);
    }

    const universityNodes = await tx.learningPathNode.findMany({
      where: { caseId: university.id },
      include: { lecture: true, exercise: true },
      orderBy: { sortOrder: 'asc' },
    });
    const existingLectureIds = new Set(
      universityNodes.filter((n) => n.type === learning_node_type.LECTURE && n.lectureId).map((n) => n.lectureId!),
    );
    for (const lecture of lectureRecords) existingLectureIds.add(lecture.id);

    // Собираем все существующие лекции, привязанные к University, плюс новые.
    const lectures = await tx.lecture.findMany({ where: { id: { in: [...existingLectureIds] } } });
    const universityExercises = await tx.exercise.findMany({
      where: { caseId: university.id },
      orderBy: { sortOrder: 'asc' },
    });

    // Пересоздаём только узлы роадмапа для University; лекции, задания и прогресс пользователей не удаляются.
    await tx.learningPathNode.deleteMany({ where: { caseId: university.id } });
    const universityPath = [
      ...lectures.map((lecture) => ({ type: learning_node_type.LECTURE, title: lecture.title, description: lecture.summary, lectureId: lecture.id, exerciseId: null as string | null })),
      ...universityExercises.map((exercise) => ({ type: learning_node_type.EXERCISE, title: exercise.title, description: exercise.description, lectureId: null as string | null, exerciseId: exercise.id })),
    ];
    for (let i = 0; i < universityPath.length; i++) {
      const node = universityPath[i];
      await tx.learningPathNode.create({
        data: {
          caseId: university.id,
          type: node.type,
          title: node.title,
          description: node.description,
          sortOrder: i + 1,
          lectureId: node.lectureId,
          exerciseId: node.exerciseId,
          isPublished: true,
        },
      });
    }

    // VK Base: если скрипт уже запускался, используем существующие задания по названиям.
    // Если в кейсе есть другие задания, не добавляем ещё 20 поверх них: это могло бы дать неверное количество.
    const currentVkExercises = await tx.exercise.findMany({
      where: { caseId: vk.id },
      orderBy: { sortOrder: 'asc' },
      include: { exerciseHints: true, exerciseSolution: true },
    });
    const taskTitles = new Set(vkTasks.map((t) => t.title));
    const unrelated = currentVkExercises.filter((e) => !taskTitles.has(e.title));
    if (unrelated.length > 0) {
      throw new Error(
        `В VK Base уже есть ${unrelated.length} заданий с другими названиями. Скрипт остановлен, чтобы не создать больше 20 заданий. Проверь их перед запуском.`,
      );
    }

    const vkExerciseRecords = [];
    for (let i = 0; i < vkTasks.length; i++) {
      const task = vkTasks[i];
      const existing = currentVkExercises.find((e) => e.title === task.title);
      const sortOrder = i + 1;
      const exercise = existing
        ? await tx.exercise.update({
            where: { id: existing.id },
            data: {
              description: task.description,
              difficulty: task.difficulty as exercise_difficulty,
              sortOrder,
              isPublished: true,
            },
          })
        : await tx.exercise.create({
            data: {
              caseId: vk.id,
              title: task.title,
              description: task.description,
              difficulty: task.difficulty as exercise_difficulty,
              sortOrder,
              isPublished: true,
            },
          });

      await tx.exerciseSolution.upsert({
        where: { exerciseId: exercise.id },
        update: { query: task.solution },
        create: { exerciseId: exercise.id, query: task.solution },
      });

      for (let level = 1; level <= task.hints.length; level++) {
        await tx.exerciseHint.upsert({
          where: { exerciseId_level: { exerciseId: exercise.id, level } },
          update: { content: task.hints[level - 1] },
          create: { exerciseId: exercise.id, level, content: task.hints[level - 1] },
        });
      }
      vkExerciseRecords.push(exercise);
    }

    await tx.learningPathNode.deleteMany({ where: { caseId: vk.id } });
    for (let i = 0; i < vkExerciseRecords.length; i++) {
      const exercise = vkExerciseRecords[i];
      await tx.learningPathNode.create({
        data: {
          caseId: vk.id,
          type: learning_node_type.EXERCISE,
          title: exercise.title,
          description: exercise.description,
          sortOrder: i + 1,
          exerciseId: exercise.id,
          isPublished: true,
        },
      });
    }

    // Публикуем оба кейса, чтобы новые этапы были видны пользователям.
    await tx.learningCase.updateMany({
      where: { id: { in: [university.id, vk.id] } },
      data: { isPublished: true },
    });
  });

  const [universityCount, universityLectureCount, vkCount, vkHintCount] = await Promise.all([
    prisma.exercise.count({ where: { caseId: university.id } }),
    prisma.learningPathNode.count({ where: { caseId: university.id, type: learning_node_type.LECTURE } }),
    prisma.exercise.count({ where: { caseId: vk.id } }),
    prisma.exerciseHint.count({ where: { exercise: { caseId: vk.id } } }),
  ]);

  console.log('Roadmap seed completed');
  console.log(`University: ${universityLectureCount} lecture nodes, ${universityCount} exercises`);
  console.log(`VK Base: ${vkCount} exercises, ${vkHintCount} hints`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
