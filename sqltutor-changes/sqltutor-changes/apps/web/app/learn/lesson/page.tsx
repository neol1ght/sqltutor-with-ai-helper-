import type { Metadata } from 'next'
import { LessonWorkspace } from '@/components/learn/lesson/lesson-workspace'

export const metadata: Metadata = { title: 'Практика SQL' }

export default function LessonPage() {
  return <LessonWorkspace />
}
