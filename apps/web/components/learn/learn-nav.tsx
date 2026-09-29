


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Code2, Flame, LayoutDashboard, LogOut, Trophy } from 'lucide-react'
import { Logo } from '@/components/site/logo'
import { cn } from '@/lib/utils'

const NAV = [
    { href: '/learn', label: 'Главная', icon: LayoutDashboard },
    { href: '/learn/lesson', label: 'Текущий урок', icon: Code2 },
    { href: '/learn#courses', label: 'Мои курсы', icon: BookOpen },
    { href: '/learn#challenges', label: 'Задачи', icon: Trophy },
]

export function LearnSidebar() {
    const pathname = usePathname()

    return (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
            <Logo href="/learn" className="px-2" />

            <nav aria-label="Обучение" className="mt-8">
                <ul className="space-y-1">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                        active
                                            ? 'bg-sidebar-accent font-medium text-foreground'
                                            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                                    )}
                                >
                                    <Icon className={cn('size-4', active && 'text-primary')} aria-hidden="true" />
                                    {label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="mt-8 rounded-xl border border-warn/25 bg-warn/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                    <Flame className="size-4 text-warn" aria-hidden="true" />
                    12 дней подряд
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Пройдите один урок сегодня, чтобы не прерывать серию.
                </p>
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-lg border border-sidebar-border p-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-ai/15 text-sm font-semibold text-ai" aria-hidden="true">
          АИ
        </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Алексей Иванов</p>
                    <p className="truncate text-xs text-muted-foreground">Тариф Pro</p>
                </div>
                <Link href="/" aria-label="Выйти" className="text-muted-foreground hover:text-foreground">
                    <LogOut className="size-4" />
                </Link>
            </div>
        </aside>
    )
}

export function LearnMobileNav() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                <Logo href="/learn" />
                <span className="flex items-center gap-1.5 rounded-full bg-warn/10 px-2.5 py-1 text-xs font-medium text-warn">
          <Flame className="size-3.5" aria-hidden="true" />
          12
          <span className="sr-only">дней подряд</span>
        </span>
            </div>
            <nav aria-label="Обучение" className="overflow-x-auto px-2 pb-2">
                <ul className="flex gap-1">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                                        active ? 'bg-muted text-foreground' : 'text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                    {label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </header>
    )
}

