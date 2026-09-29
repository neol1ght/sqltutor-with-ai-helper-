export type RunResult =
  | { status: 'error'; message: string }
  | { status: 'wrong' | 'correct'; columns: string[]; rows: (string | number)[][]; feedback: string; ms: number }

export const LESSON = {
  course: 'Соединения и агрегация',
  kind: 'Практика' as const,
  number: 15,
  total: 30,
  title: 'Фильтрация групп с HAVING',
  starter: `-- Найдите категории со средней ценой выше 50
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category
`,
  schema: [
    {
      table: 'products',
      columns: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'price', type: 'numeric' },
        { name: 'stock', type: 'int' },
      ],
    },
  ],
}

const PRODUCTS: (string | number)[][] = [
  [1, 'Наушники с шумоподавлением', 'Электроника', 249.0, 34],
  [2, 'Письменный стол из дуба', 'Мебель', 189.0, 8],
  [3, 'Детектив в мягкой обложке', 'Книги', 14.9, 120],
  [4, 'Коврик для йоги', 'Спорт', 39.5, 64],
  [5, 'Деревянный пазл', 'Игрушки', 22.0, 51],
  [6, 'Механическая клавиатура', 'Электроника', 120.0, 22],
]

const ALL_GROUPS: (string | number)[][] = [
  ['Электроника', 184.5],
  ['Мебель', 129.0],
  ['Спорт', 62.25],
  ['Игрушки', 24.1],
  ['Книги', 18.4],
]

const normalize = (q: string) =>
  q
    .replace(/--[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

export function runLessonQuery(query: string): RunResult {
  const q = normalize(query)
  const ms = 8 + Math.round(Math.random() * 14)

  if (!q) return { status: 'error', message: 'запрос пуст. Напишите оператор SELECT, чтобы начать.' }
  if (!q.startsWith('select') && !q.startsWith('with'))
    return { status: 'error', message: `ошибка синтаксиса (примерное положение: "${q.split(' ')[0]}")` }
  if (!q.includes('from products'))
    return { status: 'error', message: 'отношение не существует — в этом уроке используется таблица "products".' }
  if (/where[^;]*\b(avg|sum|count|min|max)\s*\(/.test(q))
    return { status: 'error', message: 'агрегатные функции нельзя применять в WHERE' }

  const hasGroup = q.includes('group by')
  const hasAvg = q.includes('avg(')
  const havingMatch = q.match(/having\s+avg\s*\(\s*price\s*\)\s*(>=|>)\s*(\d+(?:\.\d+)?)/)

  if (hasGroup && hasAvg && havingMatch) {
    const threshold = Number(havingMatch[2])
    const op = havingMatch[1]
    const rows = ALL_GROUPS.filter(([, avg]) => (op === '>' ? Number(avg) > threshold : Number(avg) >= threshold))
    const sorted = q.includes('order by') && q.includes('desc') ? rows : [...rows].reverse()
    const isCorrect = threshold === 50 && q.includes('order by') && q.includes('desc')
    return {
      status: isCorrect ? 'correct' : 'wrong',
      columns: ['category', 'avg_price'],
      rows: sorted,
      ms,
      feedback: isCorrect
        ? 'Верно! Все 3 ожидаемые строки совпадают и идут в правильном порядке.'
        : threshold !== 50
          ? `Почти — в задании нужна средняя цена выше 50, а вы отфильтровали по ${threshold}.`
          : 'Строки совпадают, но порядок неверный. Отсортируйте по avg_price от большего к меньшему.',
    }
  }

  if (hasGroup && hasAvg) {
    return {
      status: 'wrong',
      columns: ['category', 'avg_price'],
      rows: [...ALL_GROUPS].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'ru')),
      ms,
      feedback: 'Вы вернули 5 групп, но средняя цена выше 50 только у трёх. Отфильтруйте группы.',
    }
  }

  return {
    status: 'wrong',
    columns: ['id', 'name', 'category', 'price', 'stock'],
    rows: PRODUCTS,
    ms,
    feedback: 'Запрос возвращает отдельные товары. В задаче нужна одна строка на категорию со средней ценой.',
  }
}
