'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

import { createTelegramLink } from '@/lib/api/telegram'

const TOKEN_KEY = 'sqltutor_access_token'

export function TelegramFeatureCard() {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    async function handleClick() {
        const accessToken =
            typeof window !== 'undefined'
                ? localStorage.getItem(TOKEN_KEY)
                : null

        // Неавторизованных отправляем на страницу входа.
        if (!accessToken) {
            router.push('/login')
            return
        }

        setBusy(true)

        try {
            // Создаём одноразовую ссылку и открываем Telegram-бота.
            const link = await createTelegramLink()

            window.open(link.url, '_blank', 'noopener,noreferrer')

            // На странице профиля пользователь увидит статус привязки.
            router.push('/learn/profile')
        } catch (error) {
            // Сессия истекла — на вход. В остальных случаях
            // (уже привязан, бот не настроен) профиль покажет
            // актуальный статус и возможную ошибку.
            if (
                error instanceof Error &&
                error.message.includes('401')
            ) {
                router.push('/login')
                return
            }

            router.push('/learn/profile')
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            aria-label="Привязать Telegram-бота"
            className="group relative w-full overflow-hidden rounded-2xl border border-[#229ED9]/25 bg-gradient-to-br from-[#229ED9]/10 via-card to-card bg-[#229ED9]/15 p-6 text-left transition-colors hover:border-[#229ED9]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]/50 disabled:cursor-wait disabled:opacity-70 md:col-span-2"
        >
            {/* Telegram icon */}
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#229ED9]/15 text-[#229ED9]">
                <Send className="size-5" aria-hidden="true" />
            </div>

            {/* Content */}
            <h3 className="mt-5 font-semibold">
                Telegram-бот
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Продолжайте обучение в Telegram: получайте задания,
                подсказки и следите за своим прогрессом прямо в мессенджере.
            </p>

            <p className="mt-4 text-xs font-medium text-[#229ED9]">
                {busy
                    ? 'Открываем Telegram…'
                    : 'Нажмите, чтобы привязать бота'}
            </p>

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -bottom-12 -right-12 size-28 rounded-full bg-[#229ED9]/10 blur-2xl transition-all duration-500 group-hover:bg-[#229ED9]/15" />
        </button>
    )
}
