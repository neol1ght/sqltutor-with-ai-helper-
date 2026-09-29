import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function Cta() {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card px-6 py-16 text-center sm:px-12">
          <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div aria-hidden="true" className="absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-sm text-primary">{'SELECT * FROM your_future;'}</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Ваш первый запрос — через 60 секунд.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Курс «Основы SQL» бесплатен навсегда. Без банковской карты и установки программ.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'h-11 px-5 text-base' })}>
                Создать бесплатный аккаунт
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-11 px-5 text-base' })}
              >
                У меня уже есть аккаунт
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
