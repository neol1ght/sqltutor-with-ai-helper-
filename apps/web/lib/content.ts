export type Level = 'Начальный' | 'Средний' | 'Продвинутый'
export type Tone = 'primary' | 'ai' | 'warn'

export type Course = {
  slug: string
  title: string
  level: Level
  tone: Tone
  theory: number
  practice: number
  hours: number
  description: string
  topics: string[]
  snippet: string
}

export const courses: Course[] = [
  {
    slug: 'basics',
    title: 'Основы SQL',
    level: 'Начальный',
    tone: 'primary',
    theory: 10,
    practice: 14,
    hours: 8,
    description: 'С нуля до уверенных запросов на реальной таблице онлайн магазина. Без установки и настройки — всё в браузере.',
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'DISTINCT'],
    snippet: "SELECT name FROM users WHERE city = 'Москва';",
  },
  {
    slug: 'advanced',
    title: 'Продвинутый SQL',
    level: 'Средний',
    tone: 'ai',
    theory: 12,
    practice: 18,
    hours: 12,
    description: 'Связывайте таблицы, группируйте данные и превращайте миллионы строк в ответы для бизнеса.',
    topics: ['JOIN', 'GROUP BY', 'HAVING', 'Подзапросы', 'CASE'],
    snippet: 'SELECT category, AVG(price) FROM products GROUP BY 1;',
  },
  {
    slug: 'pro',
    title: 'SQL для профессионалов',
    level: 'Продвинутый',
    tone: 'warn',
    theory: 9,
    practice: 15,
    hours: 16,
    description: 'Оконные функции, CTE и оптимизация: пишите запросы, которые не стыдно показать на собеседовании.',
    topics: ['OVER', 'PARTITION BY', 'WITH', 'Индексы', 'EXPLAIN'],
    snippet: 'SELECT RANK() OVER (PARTITION BY team ORDER BY score DESC)',
  },
]

export const lessonCount = (c: Course) => c.theory + c.practice

export function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

export type Review = {
  name: string
  role: string
  quote: string
  course: string
}

export const reviews: Review[] = [
  {
    name: 'Анна Соколова',
    role: 'Аналитик данных в финтехе',
    quote:
      'AI-помощник никогда не даёт готовый ответ. Он задаёт правильный вопрос — и JOIN внезапно становится понятным. Через две недели я прошла техническое собеседование.',
    course: 'Соединения и агрегация',
  },
  {
    name: 'Дмитрий Орлов',
    role: 'Продакт-менеджер',
    quote:
      'Перестал ждать команду данных. После второго курса пишу запросы для дашбордов сам — и понимаю, что именно они делают.',
    course: 'Соединения и агрегация',
  },
  {
    name: 'Елена Фёдорова',
    role: 'Студентка ВМК',
    quote:
      'Оконные функции пугали меня целый год. Пошаговый предпросмотр результата помог разобраться с RANK и LAG за один вечер.',
    course: 'Продвинутый SQL',
  },
  {
    name: 'Максим Лебедев',
    role: 'Backend-разработчик',
    quote:
      'Блок про оптимизацию окупился сразу: отчёт, который выполнялся 9 секунд, теперь работает за 180 мс благодаря индексам и EXPLAIN.',
    course: 'Продвинутый SQL',
  },
  {
    name: 'Ольга Никитина',
    role: 'Маркетолог',
    quote:
      'Мне было важно, что ничего не нужно устанавливать. Открыла браузер, написала первый SELECT меньше чем за минуту — и не могла остановиться.',
    course: 'Основы SQL',
  },
  {
    name: 'Артём Ковалёв',
    role: 'Junior-разработчик',
    quote:
      'Когда запрос был неверным, помощник объяснил, какая именно строка лишняя и почему. Намного лучше, чем часами читать форумы.',
    course: 'Основы SQL',
  },
]

export const toneClasses: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  primary: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/25',
    dot: 'bg-primary',
  },
  ai: {
    text: 'text-ai',
    bg: 'bg-ai/10',
    border: 'border-ai/25',
    dot: 'bg-ai',
  },
  warn: {
    text: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/25',
    dot: 'bg-warn',
  },
}
