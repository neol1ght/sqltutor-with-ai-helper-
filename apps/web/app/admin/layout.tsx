import type { Metadata } from 'next'
import { AdminMobileNav, AdminSidebar } from '@/components/admin/admin-nav'

export const metadata: Metadata = { title: 'Администрирование' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav />
        {children}
      </div>
    </div>
  )
}
