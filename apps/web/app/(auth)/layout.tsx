import { Sparkles } from 'lucide-react'
import { SqlCode } from '@/components/sql/sql-code'
import { Logo } from '@/components/site/logo'

const QUERY = `SELECT skill, level
FROM my_progress
WHERE learner = 'you'
ORDER BY level DESC;`

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-card lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div aria-hidden="true" className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <div aria-hidden="true" className="absolute right-0 top-0 h-72 w-72 rounded-full bg-ai/20 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-md">
          <div className="animate-float rounded-2xl border border-border bg-code p-5 shadow-2xl shadow-black/40">
            <pre className="text-sm leading-6">
              <SqlCode code={QUERY} />
            </pre>
            <table className="mt-4 w-full border-t border-border font-mono text-xs">
              <tbody>
                {[
                  ['JOIN', 'эксперт'],
                  ['GROUP BY', 'уверенно'],
                  ['Оконные функции', 'в процессе…'],
                ].map(([skill, level]) => (
                  <tr key={skill} className="border-b border-border/60 last:border-0">
                    <td className="py-2">{skill}</td>
                    <td className="py-2 text-right text-primary">{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="relative -mt-4 ml-10 rounded-xl border border-ai/30 bg-popover p-4 shadow-xl">
            <p className="flex items-center gap-2 text-xs font-medium text-ai">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI-помощник
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {'С возвращением! Вчера вы отлично разобрались с LEFT JOIN. Готовы попробовать RANK() с PARTITION BY?'}
            </p>
          </div>

          <blockquote className="mt-12">
            <p className="text-pretty text-xl leading-relaxed">
              {'«За три недели я перешла от копирования чужих запросов к написанию своих с нуля».'}
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">Анна С. — аналитик данных</footer>
          </blockquote>
        </div>
      </aside>
    </div>
  )
}
