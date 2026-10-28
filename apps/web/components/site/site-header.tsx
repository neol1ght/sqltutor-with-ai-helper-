
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Menu,
    UserRound,
    X,
} from 'lucide-react';

import {
    buttonVariants,
} from '@/components/ui/button';

import { cn } from '@/lib/utils';

import {
    getCurrentUser,
    logout,
} from '@/lib/auth/session';

import type {
    AuthUser,
} from '@/lib/api/auth';

import { Logo } from './logo';

const NAV = [
    {
        href: '/#features',
        label: 'Возможности',
    },
    {
        href: '/#tracks',
        label: 'Курсы',
    },
    {
        href: '/#how-it-works',
        label: 'Как проходит обучение',
    },
    {
        href: '/#reviews',
        label: 'Отзывы',
    },
    {
        href: '/instruction',
        label: 'Инструкция',
    },
];

export function SiteHeader() {
    const [open, setOpen] =
        useState(false);

    const [user, setUser] =
        useState<AuthUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            try {
                const currentUser =
                    await getCurrentUser();

                if (mounted) {
                    setUser(currentUser);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadSession();

        return () => {
            mounted = false;
        };
    }, []);

    async function handleLogout() {
        setLoading(true);

        try {
            await logout();
        } finally {
            setUser(null);
            setOpen(false);
            setLoading(false);
        }
    }

    const userName =
        user?.firstName ||
        user?.email ||
        'Профиль';

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
                <Logo />

                <nav
                    aria-label="Основная навигация"
                    className="hidden md:block"
                >
                    <ul className="flex items-center gap-1">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Desktop actions */}
                <div className="hidden items-center gap-2 md:flex">
                    {loading ? (
                        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
                    ) : user ? (
                        <>
                            <Link
                                href="/learn/profile"
                                className={cn(
                                    buttonVariants({
                                        variant: 'ghost',
                                        size: 'lg',
                                    }),
                                    'gap-2',
                                )}
                            >
                                <UserRound className="size-4" />

                                <span className="max-w-32 truncate">
                                    {userName}
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        size: 'lg',
                                    }),
                                )}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'lg',
                                })}
                            >
                                Войти
                            </Link>

                            <Link
                                href="/signup"
                                className={buttonVariants({
                                    size: 'lg',
                                    className: 'px-4',
                                })}
                            >
                                Начать бесплатно
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    aria-label={
                        open
                            ? 'Закрыть меню'
                            : 'Открыть меню'
                    }
                    onClick={() =>
                        setOpen((value) => !value)
                    }
                >
                    {open ? (
                        <X className="size-4" />
                    ) : (
                        <Menu className="size-4" />
                    )}
                </button>
            </div>

            {/* Mobile navigation */}
            <div
                id="mobile-nav"
                className={cn(
                    'border-t border-border/60 px-4 pb-6 pt-2 md:hidden',
                    open ? 'block' : 'hidden',
                )}
            >
                <nav aria-label="Мобильная навигация">
                    <ul className="flex flex-col">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() =>
                                        setOpen(false)
                                    }
                                    className="block rounded-md px-2 py-3 text-base text-muted-foreground hover:text-foreground"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    {loading ? (
                        <div className="col-span-2 h-10 animate-pulse rounded-lg bg-muted" />
                    ) : user ? (
                        <>
                            <Link
                                href="/profile"
                                onClick={() =>
                                    setOpen(false)
                                }
                                className={cn(
                                    buttonVariants({
                                        variant:
                                            'outline',
                                        size: 'lg',
                                    }),
                                    'gap-2',
                                )}
                            >
                                <UserRound className="size-4" />

                                <span className="truncate">
                                    {userName}
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className={cn(
                                    buttonVariants({
                                        size: 'lg',
                                    }),
                                )}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() =>
                                    setOpen(false)
                                }
                                className={buttonVariants({
                                    variant:
                                        'outline',
                                    size: 'lg',
                                })}
                            >
                                Войти
                            </Link>

                            <Link
                                href="/signup"
                                onClick={() =>
                                    setOpen(false)
                                }
                                className={buttonVariants({
                                    size: 'lg',
                                })}
                            >
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

