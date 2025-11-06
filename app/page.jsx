'use client'
import { useState } from 'react'

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSummarize = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setSummary('')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      const data = await res.json()
      setSummary(data.summary)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">MeetNote – AI Meeting Summarizer</h1>
      
      <textarea
        className="w-full border rounded-lg p-3 min-h-[150px]"
        placeholder="Paste your meeting transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Summarizing...' : 'Generate Summary'}
      </button>

      {summary && (
        <div className="mt-6 bg-gray-50 border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </main>
  )
}
