
import Link from 'next/link';
import {
    ArrowLeft,
    Download,
    FileText,
    PlayCircle,
} from 'lucide-react';

const documents = [
    {
        title: 'Заключение куратора',
        description:
            'Заключение куратора на конкурсный проект',
        file: '/instruction/Zaklyuchenie_kuratora_na_konkursnyi_774_proekt_Komkin.docx',
    },
    {
        title: 'Рекомендация по запуску проекта',
        description:
            'Рекомендации по запуску и дальнейшему развитию проекта.',
        file: '/instruction/Рекомендация%20по%20запуску%20проекта.docx',
    },
];
export default function InstructionPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    На главную
                </Link>

                <div className="mb-10 max-w-2xl">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <PlayCircle className="size-6" />
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Инструкция
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Видеоинструкция и документы,
                        которые помогут разобраться
                        в работе с проектом.
                    </p>
                </div>

                <section className="mb-10">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Видеоинструкция
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Посмотри видео перед началом работы.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <video
                            controls
                            preload="metadata"
                            playsInline
                            className="aspect-video w-full bg-black"
                        >

                            <source
                                src="/instruction/Краткий%20гайд%20по%20платформе.mp4"
                                type="video/mp4"
                            />

                            Твой браузер не поддерживает
                            воспроизведение видео.
                        </video>
                    </div>
                </section>

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Документы
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Открой или скачай необходимые материалы.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {documents.map((document) => (
                            <article
                                key={document.file}
                                className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                            >
                                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                    <FileText className="size-5" />
                                </div>

                                <h3 className="font-semibold">
                                    {document.title}
                                </h3>

                                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                                    {document.description}
                                </p>

                                <a
                                    href={document.file}
                                    download
                                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                                >
                                    <Download className="size-4" />
                                    Скачать DOCX
                                </a>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
