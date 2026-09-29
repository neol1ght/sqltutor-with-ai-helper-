'use client';

import { useState } from 'react';

import { Header } from './header';
import { Sidebar } from './sidebar';

type AppShellProps = {
    children: React.ReactNode;
};

export function AppShell({
                             children,
                         }: AppShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
            />

            <div className="lg:pl-[260px]">
                <Header
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                />

                <main className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1440px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}