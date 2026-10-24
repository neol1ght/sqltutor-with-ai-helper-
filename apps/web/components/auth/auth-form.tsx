
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    login,
    register,
} from '@/lib/api/auth';

type Mode = 'login' | 'signup';

const COPY: Record<
    Mode,
    {
        title: string;
        subtitle: string;
        cta: string;
        switchText: string;
        switchLink: string;
        switchHref: string;
    }
> = {
    login: {
        title: 'С возвращением',
        subtitle: 'Войдите, чтобы продолжить серию занятий.',
        cta: 'Войти',
        switchText: 'Ещё нет аккаунта?',
        switchLink: 'Зарегистрироваться',
        switchHref: '/signup',
    },
    signup: {
        title: 'Создайте аккаунт',
        subtitle: 'Начните с бесплатного курса «Основы SQL».',
        cta: 'Создать аккаунт',
        switchText: 'Уже есть аккаунт?',
        switchLink: 'Войти',
        switchHref: '/login',
    },
};

const ACCESS_TOKEN_KEY = 'sqltutor_access_token';
const REFRESH_TOKEN_KEY = 'sqltutor_refresh_token';
const USER_KEY = 'sqltutor_user';

const NAME_PATTERN =
    /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;

function validateName(
    value: string,
    label: string,
): string | null {
    if (value.length < 2 || value.length > 50) {
        return `${label}: от 2 до 50 символов.`;
    }

    if (!NAME_PATTERN.test(value)) {
        return `${label}: используйте только буквы, пробелы, дефис или апостроф.`;
    }

    return null;
}

function validatePassword(password: string): string | null {
    if (password.length < 10 || password.length > 100) {
        return 'Пароль должен содержать от 10 до 100 символов.';
    }

    if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
        return 'Пароль должен содержать хотя бы одну букву и одну цифру.';
    }

    const normalized = password.toLowerCase().replace(/\s+/g, '');

    const commonPasswords = new Set([
        'qwerty123',
        'qwerty12345',
        '123123123',
        '123456789',
        '1234567890',
        'password123',
        'admin12345',
        'qwertyuiop',
        'пароль123',
        'пароль12345',
    ]);

    const sequences = [
        'qwerty',
        'asdfgh',
        'zxcv',
        'йцукен',
        'фыва',
        'ячсм',
        '12345',
        '23456',
        '34567',
        '45678',
        '56789',
        'abcdef',
        '98765',
        '87654',
    ];

    if (
        commonPasswords.has(normalized) ||
        /^(.)\1+$/u.test(normalized) ||
        /^(.{1,4})\1+$/u.test(normalized) ||
        sequences.some((sequence) => normalized.includes(sequence))
    ) {
        return 'Пароль слишком простой. Придумайте более сложный.';
    }

    return null;
}

export function AuthForm({
                             mode,
                         }: {
    mode: Mode;
}) {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copy = COPY[mode];

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();

        if (pending) {
            return;
        }

        const formData = new FormData(e.currentTarget);

        const email = String(
            formData.get('email') ?? '',
        ).trim();

        const password = String(
            formData.get('password') ?? '',
        );

        const firstName =
            mode === 'signup'
                ? String(formData.get('firstName') ?? '')
                    .trim()
                    .replace(/\s+/g, ' ')
                : '';

        const lastName =
            mode === 'signup'
                ? String(formData.get('lastName') ?? '')
                    .trim()
                    .replace(/\s+/g, ' ')
                : '';

        if (mode === 'signup') {
            const nameError =
                validateName(firstName, 'Имя') ??
                validateName(lastName, 'Фамилия');

            if (nameError) {
                setError(nameError);
                return;
            }

            const passwordError = validatePassword(password);

            if (passwordError) {
                setError(passwordError);
                return;
            }
        }

        setError(null);
        setPending(true);

        try {
            const response =
                mode === 'login'
                    ? await login(email, password)
                    : await register(
                        email,
                        password,
                        firstName,
                        lastName,
                    );

            localStorage.setItem(
                ACCESS_TOKEN_KEY,
                response.accessToken,
            );

            localStorage.setItem(
                REFRESH_TOKEN_KEY,
                response.refreshToken,
            );

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(response.user),
            );

            router.push('/learn');
            router.refresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    mode === 'login'
                        ? 'Не удалось выполнить вход.'
                        : 'Не удалось создать аккаунт.',
                );
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold tracking-tight">
                {copy.title}
            </h1>

            <p className="mt-2 text-muted-foreground">
                {copy.subtitle}
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
            >
                {mode === 'signup' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                Имя
                            </Label>

                            <Input
                                id="firstName"
                                name="firstName"
                                autoComplete="given-name"
                                required
                                minLength={2}
                                maxLength={50}
                                placeholder="Алексей"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Фамилия
                            </Label>

                            <Input
                                id="lastName"
                                name="lastName"
                                autoComplete="family-name"
                                required
                                minLength={2}
                                maxLength={50}
                                placeholder="Иванов"
                                className="h-10"
                            />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">
                        Эл. почта
                    </Label>

                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={255}
                        placeholder="you@example.ru"
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                            Пароль
                        </Label>

                        {mode === 'login' && (
                            <Link
                                href="/login"
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Забыли пароль?
                            </Link>
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={
                                mode === 'login'
                                    ? 'current-password'
                                    : 'new-password'
                            }
                            required
                            minLength={
                                mode === 'signup' ? 10 : undefined
                            }
                            maxLength={
                                mode === 'signup' ? 100 : undefined
                            }
                            placeholder={
                                mode === 'signup'
                                    ? 'Не менее 10 символов'
                                    : '••••••••'
                            }
                            className="h-10 pr-10"
                            aria-invalid={error ? true : undefined}
                            aria-describedby={
                                error ? 'auth-error' : undefined
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((value) => !value)
                            }
                            className="absolute right-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                            aria-label={
                                showPassword
                                    ? 'Скрыть пароль'
                                    : 'Показать пароль'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>

                    {mode === 'signup' && (
                        <p className="text-xs text-muted-foreground">
                            От 10 символов, минимум одна буква
                            и одна цифра. Простые пароли
                            не допускаются.
                        </p>
                    )}

                    {error && (
                        <p
                            id="auth-error"
                            role="alert"
                            className="text-sm text-destructive"
                        >
                            {error}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="h-10 w-full text-sm"
                    disabled={pending}
                >
                    {pending ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            <span className="sr-only">
                                Отправка…
                            </span>
                        </>
                    ) : (
                        <>
                            {copy.cta}
                            <ArrowRight
                                data-icon="inline-end"
                                aria-hidden="true"
                            />
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                {copy.switchText}{' '}

                <Link
                    href={copy.switchHref}
                    className="font-medium text-primary hover:underline"
                >
                    {copy.switchLink}
                </Link>
            </p>
        </div>
    );
}
