import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { HeroEditor } from './hero-editor'

const STATS = [
  { value: '48 тыс.+', label: 'учеников' },
  { value: '1,2 млн', label: 'выполненных запросов' },
  { value: '4,9/5', label: 'средняя оценка' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-28 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-24">
        <div>
          <Link
            href="/#features"
            className="group inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai/10 py-1 pl-1 pr-3 text-xs text-foreground/90 transition-colors hover:border-ai/60"
          >
            <span className="flex items-center gap-1 rounded-full bg-ai px-2 py-0.5 font-medium text-ai-foreground">
              <Sparkles className="size-3" aria-hidden="true" />
              Новое
            </span>
            AI-помощник теперь объясняет планы запросов
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Изучайте SQL, <span className="text-primary">сразу применяя</span> его на практике.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {'Настоящие базы данных прямо в браузере, короткие уроки теории и практики и AI-помощник, который подводит к ответу, а не выдаёт его готовым. От первого '}
            <code className="font-mono text-foreground">SELECT</code>
            {' до оконных функций.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'h-11 px-5 text-base' })}>
              Начать бесплатно
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href="/learn/lesson"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-11 px-5 text-base' })}
            >
              Продолжить обучение
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight">{s.value}</dd>
                <dd className="text-sm text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroEditor />
      </div>
    </section>
  )
}
