import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}
      aria-label="SQLTutor — на главную"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground"
      >
        {'>_'}
      </span>
      <span className="text-lg">
        SQL<span className="text-primary">Tutor</span>
      </span>
    </Link>
  )
}
