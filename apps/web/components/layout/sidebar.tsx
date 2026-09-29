'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    BarChart3,
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Settings,
    Trophy,
    User,
    X,
} from 'lucide-react';

type SidebarProps = {
    mobileOpen: boolean;
    onClose: () => void;
};

const mainNavigation = [
    {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        label: 'Cases',
        href: '/cases',
        icon: BookOpen,
    },
    {
        label: 'Progress',
        href: '/progress',
        icon: BarChart3,
    },
    {
        label: 'Achievements',
        href: '/achievements',
        icon: Trophy,
    },
];

const secondaryNavigation = [
    {
        label: 'Profile',
        href: '/profile',
        icon: User,
    },
    {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function Sidebar({
                            mobileOpen,
                            onClose,
                        }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }

        return pathname.startsWith(href);
    };

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50 flex h-screen
                    w-[260px] flex-col
                    border-r border-[var(--border)]
                    bg-[var(--sidebar)]
                    px-4 py-5
                    transition-transform duration-200
                    lg:translate-x-0
                    ${
                    mobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }
                `}
            >
                <div className="mb-8 flex items-center justify-between px-3">
                    <Link
                        href="/"
                        onClick={onClose}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm">
                            <GraduationCap
                                size={22}
                                strokeWidth={2.2}
                            />
                        </div>

                        <div>
                            <div className="text-[17px] font-bold tracking-tight text-slate-900">
                                SQLTutor
                            </div>

                            <div className="text-[11px] font-medium text-slate-400">
                                Learn SQL by practice
                            </div>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col">
                    <div className="space-y-1">
                        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Learning
                        </div>

                        {mainNavigation.map(
                            ({
                                 label,
                                 href,
                                 icon: Icon,
                             }) => {
                                const active =
                                    isActive(href);

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={onClose}
                                        className={`
                                            group flex items-center gap-3
                                            rounded-xl px-3 py-2.5
                                            text-sm font-medium
                                            transition-all
                                            ${
                                            active
                                                ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                        `}
                                    >
                                        <Icon
                                            size={19}
                                            strokeWidth={
                                                active
                                                    ? 2.3
                                                    : 1.9
                                            }
                                        />

                                        <span>
                                            {label}
                                        </span>

                                        {active && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                                        )}
                                    </Link>
                                );
                            },
                        )}
                    </div>

                    <div className="mt-8">
                        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Account
                        </div>

                        <div className="space-y-1">
                            {secondaryNavigation.map(
                                ({
                                     label,
                                     href,
                                     icon: Icon,
                                 }) => {
                                    const active =
                                        isActive(href);

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={onClose}
                                            className={`
                                                group flex items-center gap-3
                                                rounded-xl px-3 py-2.5
                                                text-sm font-medium
                                                transition-all
                                                ${
                                                active
                                                    ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                            `}
                                        >
                                            <Icon
                                                size={19}
                                                strokeWidth={
                                                    active
                                                        ? 2.3
                                                        : 1.9
                                                }
                                            />

                                            <span>
                                                {label}
                                            </span>
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut
                                size={19}
                                strokeWidth={1.9}
                            />

                            <span>Logout</span>
                        </button>
                    </div>
                </nav>

                <div className="mt-4 rounded-2xl bg-[var(--primary-light)] p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[var(--primary)]">
                            <GraduationCap
                                size={16}
                            />
                        </div>

                        <span className="text-xs font-semibold text-[var(--primary-dark)]">
                            Keep learning
                        </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-500">
                        Practice SQL every day
                        and improve your skills.
                    </p>
                </div>
            </aside>
        </>
    );
}