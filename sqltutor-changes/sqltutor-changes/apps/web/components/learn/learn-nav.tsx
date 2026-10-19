
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth/session';
import {
    BookOpen,
    Flame,
    LayoutDashboard,
    LogOut,
    Sparkles,
    UserRound,
} from 'lucide-react';

import { Logo } from '@/components/site/logo';

import { cn } from '@/lib/utils';

import {
    getProfile,
    type ProfileResponse,
} from '@/lib/api/profile';

const NAV = [
    {
        href: '/learn',
        label: 'Главная',
        icon: LayoutDashboard,
        isActive: (pathname: string) => pathname === '/learn',
    },
    {
        href: '/learn/roadmap',
        label: 'Обучение',
        icon: BookOpen,
        isActive: (pathname: string) =>
            pathname.startsWith('/learn/roadmap') ||
            pathname.startsWith('/learn/lecture') ||
            pathname.startsWith('/learn/lesson'),
    },
    {
        href: '/learn/assistant',
        label: 'AI-помощник',
        icon: Sparkles,
        isActive: (pathname: string) => pathname.startsWith('/learn/assistant'),
    },
    {
        href: '/learn/profile',
        label: 'Профиль',
        icon: UserRound,
        isActive: (pathname: string) => pathname.startsWith('/learn/profile'),
    },
];

function getFullName(
    firstName: string | null,
    lastName: string | null,
) {
    const name = [
        firstName,
        lastName,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return name || 'Пользователь';
}

function getInitials(
    firstName: string | null,
    lastName: string | null,
) {
    const first =
        firstName?.charAt(0) ?? '';

    const last =
        lastName?.charAt(0) ?? '';

    const initials =
        `${first}${last}`.trim();

    return initials
        ? initials.toUpperCase()
        : 'U';
}

function getRoleLabel(
    role: ProfileResponse['user']['role'],
) {
    return role === 'ADMIN'
        ? 'Администратор'
        : 'Студент';
}

export function LearnSidebar() {
    const pathname = usePathname();

    const [
        user,
        setUser,
    ] = useState<
        ProfileResponse['user'] | null
    >(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const accessToken =
                    localStorage.getItem(
                        'sqltutor_access_token',
                    );

                if (!accessToken) {
                    return;
                }

                const profile =
                    await getProfile(
                        accessToken,
                    );

                setUser(profile.user);
            } catch {
                // Профиль не является критичным
                // для отображения навигации.
            }
        }

        loadProfile();
    }, []);

    return (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
            <Logo
                href="/"
                className="px-2"
            />

            <nav
                aria-label="Обучение"
                className="mt-8"
            >
                <ul className="space-y-1">
                    {NAV.map(
                        ({
                            href,
                            label,
                            icon: Icon,
                            isActive,
                        }) => {
                            const active = isActive(pathname);

                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={
                                            active
                                                ? 'page'
                                                : undefined
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
                                                active &&
                                                    'text-primary',
                                            )}
                                            aria-hidden="true"
                                        />

                                        {label}
                                    </Link>
                                </li>
                            );
                        },
                    )}
                </ul>
            </nav>

            <div className="mt-8 rounded-xl border border-warn/25 bg-warn/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                    <Flame
                        className="size-4 text-warn"
                        aria-hidden="true"
                    />

                    12 дней подряд
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Пройдите один урок сегодня,
                    чтобы не прерывать серию.
                </p>
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-lg border border-sidebar-border p-3">
                <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ai/15 text-sm font-semibold text-ai"
                    aria-hidden="true"
                >
                    {user
                        ? getInitials(
                            user.firstName,
                            user.lastName,
                        )
                        : 'U'}
                </span>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {user
                            ? getFullName(
                                user.firstName,
                                user.lastName,
                            )
                            : 'Пользователь'}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                        {user
                            ? getRoleLabel(
                                user.role,
                            )
                            : 'Загрузка...'}
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Выйти"
                    onClick={async () => {
                        await logout();
                        window.location.href = '/';
                    }}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                >
                    <LogOut
                        className="size-4"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </aside>
    );
}

export function LearnMobileNav() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                <Logo href="/learn" />

                <span className="flex items-center gap-1.5 rounded-full bg-warn/10 px-2.5 py-1 text-xs font-medium text-warn">
                    <Flame
                        className="size-3.5"
                        aria-hidden="true"
                    />

                    12

                    <span className="sr-only">
                        дней подряд
                    </span>
                </span>
            </div>

            <nav
                aria-label="Обучение"
                className="overflow-x-auto px-2 pb-2"
            >
                <ul className="flex gap-1">
                    {NAV.map(
                        ({
                            href,
                            label,
                            icon: Icon,
                            isActive,
                        }) => {
                            const active = isActive(pathname);

                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={
                                            active
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(
                                            'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                                            active
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        <Icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />

                                        {label}
                                    </Link>
                                </li>
                            );
                        },
                    )}
                </ul>
            </nav>
        </header>
    );
}
