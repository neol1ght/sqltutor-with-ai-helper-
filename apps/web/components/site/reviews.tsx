import { Star } from 'lucide-react'
import { reviews } from '@/lib/content'
import { SectionHeading } from './section-heading'

const AVATAR_TONES = ['bg-primary/15 text-primary', 'bg-ai/15 text-ai', 'bg-warn/15 text-warn']

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
}

export function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-20 border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Отзывы учеников"
          title="Нас любят аналитики, разработчики и все, кому интересен SQL"
          description="Тысячи учеников с SQLTutor нашли работу, получили повышение и ускорили свои отчёты."
        />

        <ul className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {reviews.map((r, i) => (
            <li key={r.name} className="mb-4 break-inside-avoid">
              <figure className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5 text-warn" aria-label="Оценка 5 из 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 leading-relaxed text-foreground/90">
                  <p>{`«${r.quote}»`}</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_TONES[i % 3]}`}
                  >
                    {initials(r.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium">{r.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{r.role}</div>
                  </div>
                </figcaption>
                <p className="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                  курс: <span className="text-primary">{r.course}</span>
                </p>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
