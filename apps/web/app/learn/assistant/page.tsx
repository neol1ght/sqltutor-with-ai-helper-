import type { Metadata } from 'next'
import { AssistantView } from '@/components/assistant/assistant-view'

export const metadata: Metadata = { title: 'AI-репетитор' }

export default function AssistantPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <AssistantView />
    </main>
  )
}
