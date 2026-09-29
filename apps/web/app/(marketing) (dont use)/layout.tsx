import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
    title: 'SQLTutor — изучай SQL на практике',
    description:
        'Интерактивная платформа для изучения SQL, баз данных и аналитики.',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body>{children}</body>
        </html>
    );
}