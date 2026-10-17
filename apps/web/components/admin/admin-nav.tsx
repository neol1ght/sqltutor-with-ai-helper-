'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Award,
    BookOpen,
    BookOpenText,
    Route,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    Users,
} from 'lucide-react'

import { Logo } from '@/components/site/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const NAV = [
    {
        href: '/admin',
        label: 'Обзор',
        icon: LayoutDashboard,
    },
    {
        href: '/admin#users',
        label: 'Пользователи',
        icon: Users,
    },
    {
        href: '/admin/cases',
        label: 'Курсы',
        icon: BookOpen,
    },
    {
        href: '/admin/lectures',
        label: 'Лекции и роадмапы',
        icon: BookOpenText,
    },
    {
        href: '/admin/exercises',
        label: 'Задачи',
        icon: Award,
    },
    {
        href: '/admin/achievements',
        label: 'Достижения',
        icon: Award,
    },
    {
        href: '/admin/hints',
        label: 'Подсказки',
        icon: Award,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
            <div className="flex items-center justify-between px-2">
                <Logo href="/" />

                <Badge
                    variant="outline"
                    className="gap-1 border-warn/30 text-warn"
                >
                    <ShieldCheck
                        className="size-3"
                        aria-hidden="true"
                    />
                    Admin
                </Badge>
            </div>

            <nav
                aria-label="Администрирование"
                className="mt-8"
            >
                <ul className="space-y-1">
                    {NAV.map(
                        ({ href, label, icon: Icon }) => {
                            const basePath = href.split('#')[0]

                            const active =
                                basePath === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(basePath)

                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                            active
                                                ? 'bg-sidebar-accent font-medium text-foreground'
                                                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-4',
                                                active && 'text-warn',
                                            )}
                                            aria-hidden="true"
                                        />

                                        {label}
                                    </Link>
                                </li>
                            )
                        },
                    )}
                </ul>
            </nav>

            <div className="mt-auto flex items-center gap-3 rounded-lg border border-sidebar-border p-3">
                <Link
                    href="/learn/profile"
                    className="flex min-w-0 flex-1 items-center gap-3"
                >
                    <Avatar
                        size="lg"
                        className="bg-warn/15"
                    >
                        <AvatarFallback className="bg-transparent text-sm font-semibold text-warn">
                            АИ
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            Алексей Иванов
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                            Администратор
                        </p>
                    </div>
                </Link>

                <Link
                    href="/"
                    aria-label="Выйти"
                    className="text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="size-4" />
                </Link>
            </div>
        </aside>
    )
}

export function AdminMobileNav() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                <Logo href="/admin" />

                <Badge
                    variant="outline"
                    className="gap-1 border-warn/30 text-warn"
                >
                    <ShieldCheck
                        className="size-3"
                        aria-hidden="true"
                    />
                    Admin
                </Badge>
            </div>

            <nav
                aria-label="Администрирование"
                className="overflow-x-auto px-2 pb-2"
            >
                <ul className="flex gap-1">
                    {NAV.map(
                        ({ href, label, icon: Icon }) => {
                            const basePath = href.split('#')[0]

                            const active =
                                basePath === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(basePath)

                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                                            active
                                                ? 'bg-sidebar-accent font-medium text-foreground'
                                                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-4',
                                                active && 'text-warn',
                                            )}
                                            aria-hidden="true"
                                        />

                                        {label}
                                    </Link>
                                </li>
                            )
                        },
                    )}
                </ul>
            </nav>
        </header>
    )
}
