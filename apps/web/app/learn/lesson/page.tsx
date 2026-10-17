import type { Metadata } from 'next'
import { LessonWorkspace } from '@/components/learn/lesson/lesson-workspace'

export const metadata: Metadata = { title: 'Фильтрация групп с HAVING' }

export default function LessonPage() {
  return <LessonWorkspace />
}
