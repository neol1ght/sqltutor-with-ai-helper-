import { SectionHeading } from './section-heading'

const STEPS = [
  {
    step: '01',
    title: 'Выберите курс',
    description: 'Пройдите тест на 2 минуты или сразу выберите один из трёх курсов под свой уровень.',
    code: "SELECT course FROM goals\nWHERE you = 'ready';",
  },
  {
    step: '02',
    title: 'Теоретический урок',
    description: 'Короткое объяснение концепции и интерактивный пример, который можно менять и запускать.',
    code: '-- WHERE фильтрует строки\n-- HAVING фильтрует группы',
  },
  {
    step: '03',
    title: 'Практический урок',
    description: 'Решите реальную задачу в живом редакторе. Запускайте сколько угодно — ошибки помогают учиться.',
    code: 'SELECT category, AVG(price)\nFROM products GROUP BY 1;',
  },
  {
    step: '04',
    title: 'Проверка и рост',
    description: 'Мгновенная проверка, подсказки AI-помощника и XP, которые открывают следующий урок.',
    code: '-- ✓ Верно! +20 XP\n-- Далее: оконные функции',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Как проходит обучение"
          title="Цикл обучения, который не даёт остановиться"
          description="Теория чередуется с практикой, а проверка происходит мгновенно. Большинство учеников проходят урок меньше чем за 10 минут."
        />

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-primary/60 via-ai/60 to-warn/60 md:block"
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.step} className="relative">
                <span className="relative flex size-10 items-center justify-center rounded-full border border-primary/40 bg-background font-mono text-sm text-primary">
                  {s.step}
                </span>
                <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-code p-3 font-mono text-xs leading-5 text-muted-foreground">
                  {s.code}
                </pre>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
