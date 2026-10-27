-- VK Base: заполнение тестовыми данными для практики сложного SQL.
-- Выполнять ПОСЛЕ 040_vk_base.sql в базе sqltutor_vk_base.
-- Генерирует связанный набор пользователей, сообществ, постов, реакций, комментариев и сообщений.

BEGIN;
SET LOCAL TIME ZONE 'UTC';

INSERT INTO users (username, email, first_name, last_name, birth_date, city, bio, is_verified, is_private, status, created_at, last_seen_at)
SELECT
    'user_' || lpad(gs::text, 3, '0'),
    'user_' || lpad(gs::text, 3, '0') || '@example.com',
    (ARRAY['Александр','Мария','Иван','Анна','Дмитрий','Екатерина','Максим','София','Артём','Полина','Михаил','Виктория'])[1 + ((gs - 1) % 12)],
    (ARRAY['Иванов','Смирнова','Кузнецов','Попова','Соколов','Лебедева','Козлов','Новикова','Морозов','Петрова'])[1 + ((gs * 7 - 1) % 10)],
    DATE '1988-01-01' + ((gs * 137) % 11000),
    (ARRAY['Москва','Санкт-Петербург','Казань','Екатеринбург','Новосибирск','Самара','Минск','Алматы'])[1 + ((gs * 3 - 1) % 8)],
    'Пользователь VK Base №' || gs || '. Интересы: ' || (ARRAY['технологии','музыка','спорт','путешествия','книги','программирование'])[1 + ((gs - 1) % 6)],
    gs % 13 = 0,
    gs % 9 = 0,
    CASE WHEN gs % 37 = 0 THEN 'BANNED' WHEN gs % 29 = 0 THEN 'DEACTIVATED' ELSE 'ACTIVE' END,
    NOW() - ((gs * 11) % 900) * INTERVAL '1 day',
    NOW() - ((gs * 17) % 1000) * INTERVAL '1 hour'
FROM generate_series(1, 60) AS gs;

INSERT INTO communities (name, slug, description, category, city, is_verified, created_by, created_at)
SELECT
    (ARRAY['SQL и базы данных','Мемы каждый день','Python-разработка','Кино и сериалы','Спорт и здоровье','Путешествия по России','Музыкальный клуб','Студенческое сообщество','Дизайн и UX','Новости технологий'])[gs],
    (ARRAY['sql-databases','daily-memes','python-dev','movies-series','sport-health','travel-russia','music-club','student-community','design-ux','tech-news'])[gs],
    'Сообщество для обсуждения темы: ' || (ARRAY['SQL и базы данных','Мемы каждый день','Python-разработка','Кино и сериалы','Спорт и здоровье','Путешествия по России','Музыкальный клуб','Студенческое сообщество','Дизайн и UX','Новости технологий'])[gs],
    (ARRAY['education','entertainment','technology','entertainment','sport','travel','music','education','design','technology'])[gs],
    (ARRAY['Москва','Санкт-Петербург','Казань','Екатеринбург','Новосибирск'])[1 + ((gs - 1) % 5)],
    gs IN (1,3,10),
    1 + ((gs * 5) % 60),
    NOW() - (gs * 19) * INTERVAL '1 day'
FROM generate_series(1, 10) AS gs;

-- У каждого сообщества есть владелец; дополнительно добавляем участников.
INSERT INTO community_members (community_id, user_id, role, joined_at, notifications_enabled)
SELECT c.id, c.created_by, 'OWNER', c.created_at + INTERVAL '1 hour', TRUE
FROM communities c
ON CONFLICT DO NOTHING;

INSERT INTO community_members (community_id, user_id, role, joined_at, notifications_enabled)
SELECT c.id, u.id,
       CASE WHEN u.id % 17 = 0 THEN 'MODERATOR' WHEN u.id % 11 = 0 THEN 'ADMIN' ELSE 'MEMBER' END,
       GREATEST(c.created_at, u.created_at) + ((u.id + c.id) % 30) * INTERVAL '1 hour',
    (u.id + c.id) % 7 <> 0
FROM communities c
    CROSS JOIN users u
WHERE ((u.id * 7 + c.id * 11) % 5) IN (0,1)
  AND u.id <> c.created_by
ON CONFLICT DO NOTHING;

-- Дружба: принятые связи, ожидающие заявки, отклонения и блокировки.
INSERT INTO friendships (requester_id, addressee_id, status, requested_at, accepted_at)
SELECT
    LEAST(gs, ((gs * 7 + 13) % 60) + 1),
    GREATEST(gs, ((gs * 7 + 13) % 60) + 1),
    CASE WHEN gs % 10 = 0 THEN 'PENDING'
         WHEN gs % 17 = 0 THEN 'DECLINED'
         WHEN gs % 23 = 0 THEN 'BLOCKED'
         ELSE 'ACCEPTED' END,
    NOW() - (gs % 180) * INTERVAL '1 day',
    CASE WHEN gs % 10 <> 0 AND gs % 17 <> 0 AND gs % 23 <> 0
    THEN NOW() - (gs % 150) * INTERVAL '1 day' ELSE NULL END
FROM generate_series(1, 180) AS gs
WHERE gs <> ((gs * 7 + 13) % 60) + 1
ON CONFLICT DO NOTHING;

-- 300 постов: часть размещена от имени сообществ.
INSERT INTO posts (author_id, community_id, text, post_type, visibility, is_pinned, created_at, edited_at, deleted_at)
SELECT
    1 + ((gs * 13 + 5) % 60),
    CASE WHEN gs % 4 = 0 THEN 1 + ((gs * 3) % 10) ELSE NULL END,
    CASE (gs % 8)
      WHEN 0 THEN 'Разбираемся с SQL: задача дня №' || gs || '. Какой запрос вы бы написали?'
      WHEN 1 THEN 'Небольшое обновление из жизни. Пост №' || gs || ' — делитесь мнением в комментариях.'
      WHEN 2 THEN 'Подборка полезных материалов и ссылок, выпуск №' || gs || '.'
      WHEN 3 THEN 'Кто тоже любит обсуждать технологии и новые продукты? #tech #community'
      WHEN 4 THEN 'Сегодняшняя мысль: регулярная практика важнее идеального плана. Запись №' || gs || '.'
      WHEN 5 THEN 'Фотоотчёт с мероприятия №' || gs || '. Было здорово увидеться!'
      WHEN 6 THEN 'Вопрос подписчикам: что изучаете на этой неделе? Пост №' || gs || '.'
      ELSE 'Делюсь находкой: интересная идея для следующего проекта. Пост №' || gs || '.'
END,
    CASE WHEN gs % 19 = 0 THEN 'VIDEO' WHEN gs % 11 = 0 THEN 'PHOTO' WHEN gs % 23 = 0 THEN 'LINK' ELSE 'TEXT' END,
    CASE WHEN gs % 13 = 0 THEN 'FRIENDS' WHEN gs % 17 = 0 THEN 'COMMUNITY' ELSE 'PUBLIC' END,
    gs % 31 = 0,
    NOW() - (gs * 7 % 365) * INTERVAL '1 day' - (gs % 24) * INTERVAL '1 hour',
    CASE WHEN gs % 15 = 0 THEN NOW() - (gs * 7 % 365) * INTERVAL '1 day' - (gs % 24) * INTERVAL '1 hour' + INTERVAL '20 minutes' ELSE NULL END,
    CASE WHEN gs % 47 = 0 THEN NOW() - (gs * 7 % 365) * INTERVAL '1 day' - (gs % 24) * INTERVAL '1 hour' + INTERVAL '30 minutes' ELSE NULL END
FROM generate_series(1, 300) AS gs;

-- Просмотры: уникальный пользователь на пост.
INSERT INTO post_views (post_id, user_id, viewed_at, duration_seconds)
SELECT p.id, u.id,
       p.created_at + ((p.id * 3 + u.id) % 1000) * INTERVAL '1 minute',
    (p.id * 19 + u.id * 7) % 240

