import type { Metadata } from 'next';

import { ProfileView } from '@/components/profile/profile-view';

export const metadata: Metadata = {
    title: 'Профиль',
};

export default function ProfilePage() {
    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10">
            <ProfileView />
        </main>
    );
}