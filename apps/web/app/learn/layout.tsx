import type { Metadata } from 'next'
import { LearnMobileNav, LearnSidebar } from '@/components/learn/learn-nav'

export const metadata: Metadata = { title: 'Обучение' }

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <LearnSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <LearnMobileNav />
        {children}
      </div>
    </div>
  )
}
