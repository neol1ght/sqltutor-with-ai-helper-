
import {
  BarChart3,
  Database,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { SectionHeading } from './section-heading'
import { TelegramFeatureCard } from './telegram-feature-card'

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Возможности"
          title="Всё, чтобы действительно освоить SQL"
          description="Мы создали тренажёр, о котором мечтали сами: практика с первой минуты и терпеливый помощник рядом."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <article className="relative overflow-hidden rounded-2xl border border-ai/25 bg-gradient-to-br from-ai/15 via-card to-card p-6 md:col-span-4 md:row-span-2 md:p-8">
            <div className="flex size-10 items-center justify-center rounded-lg bg-ai/15 text-ai">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              AI-помощник, который учит, а не подсказывает ответ
            </h3>

            <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
              Застряли? Попросите подсказку, объяснение ошибки или разбор,
              почему в результате 3 лишние строки. Помощник подстраивается
              под ваш уровень и показывает решение, только если вы сами попросите.
            </p>

            <div className="mt-8 space-y-3" aria-hidden="true">
              <div className="ml-auto w-fit max-w-sm rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm">
                Почему мой запрос возвращает дубликаты?
              </div>

              <div className="w-fit max-w-md rounded-2xl rounded-bl-sm border border-ai/25 bg-background/60 px-4 py-3 text-sm leading-relaxed">
                <span className="text-ai">Хороший вопрос.</span> У каждого
                клиента несколько заказов, поэтому JOIN повторяет его строку.
                Посмотрите, что вы <em>выбираете</em> — нужны ли вам столбцы
                заказов? Попробуйте{' '}
                <code className="rounded bg-muted px-1 font-mono text-xs text-ai">
                  DISTINCT
                </code>{' '}
                или агрегацию через{' '}
                <code className="rounded bg-muted px-1 font-mono text-xs text-ai">
                  GROUP BY
                </code>
                .
              </div>
            </div>
          </article>

          <FeatureCard
            icon={<Database className="size-5" aria-hidden="true" />}
            title="Настоящие базы без настройки"
            description="Каждый урок работает с живой песочницей PostgreSQL и реалистичными данными."
          />

          <FeatureCard
            icon={<Zap className="size-5" aria-hidden="true" />}
            title="Мгновенная проверка"
            description="Результат и построчное сравнение с ожидаемым ответом — за миллисекунды."
          />

          <FeatureCard
            icon={<Target className="size-5" aria-hidden="true" />}
            title="Адаптивная сложность"
            description="Задачи усложняются по мере роста и возвращают к темам, которые даются тяжелее."
          />

          <FeatureCard
            icon={<BarChart3 className="size-5" aria-hidden="true" />}
            title="Наглядный прогресс"
            description="Серии дней, XP и карта навыков показывают, что вы уже освоили и что дальше."
          />
          <TelegramFeatureCard />

        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  className = 'md:col-span-2',
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <article
      className={`group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 ${className}`}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:-translate-y-0.5">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  )
}
