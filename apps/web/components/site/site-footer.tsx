import Link from 'next/link'
import { courses } from '@/lib/content'
import { Logo } from './logo'

const COLUMNS = [
  {
    title: 'Платформа',
    links: [
      { label: 'Возможности', href: '/#features' },
      { label: 'Курсы', href: '/#tracks' },
      { label: 'Как проходит обучение', href: '/#how-it-works' },
      { label: 'Пробный урок', href: '/learn/lesson' },
    ],
  },
  {
    title: 'Курсы',
    links: courses.map((c) => ({ label: c.title, href: '/#tracks' })),
  },
  {
    title: 'Аккаунт',
    links: [
      { label: 'Войти', href: '/login' },
      { label: 'Регистрация', href: '/signup' },
      { label: 'Личный кабинет', href: '/learn' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Интерактивное изучение SQL с AI-помощником, который превращает каждую ошибку в урок.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Все системы работают
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-medium">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>{`© ${new Date().getFullYear()} SQLTutor. Все права защищены.`}</p>
          <p className="font-mono">{'-- сделано для тех, кто любит чистые данные'}</p>
        </div>
      </div>
    </footer>
  )
}
