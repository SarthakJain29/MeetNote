'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([])

  useEffect(() => {
    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setMeetings(data)
    }
    fetchMeetings()
  }, [])

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Meeting History</h1>
      {meetings.length === 0 ? (
        <p className="text-gray-600 text-center">No summaries yet.</p>
      ) : (
        meetings.map(m => (
          <div key={m.id} className="mb-4 border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">{new Date(m.created_at).toLocaleString()}</p>
            <p className="mt-2 whitespace-pre-wrap">{m.summary}</p>
          </div>
        ))
      )}
    </main>
  )
}
