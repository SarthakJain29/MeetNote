'use client'
import { MeetingHistory } from '../components/MeetingHistory'

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meeting History
          </h1>
          <p className="text-gray-600 text-lg">
            View all your saved meeting summaries
          </p>
        </div>
        <MeetingHistory />
      </div>
    </main>
  )
}

