'use client'
import { useState } from 'react'
import { TranscriptInput } from './components/TranscriptInput'
import { SummaryCard } from './components/SummaryCard'

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSummarize = async (transcriptText) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText })
      })
      
      if (!res.ok) throw new Error('Failed to summarize')
      
      const data = await res.json()
      
      // Parse the summary to extract structured data if possible
      const parsedResult = {
        summary: data.summary,
        keyPoints: extractKeyPoints(data.summary),
        tasks: extractTasks(data.summary)
      }
      
      setResult(parsedResult)
      setTranscript(transcriptText)
    } catch (err) {
      console.error(err)
      alert('Failed to generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaved = () => {
    setResult(null)
    setTranscript('')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Meeting Summarizer
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your meeting transcripts into actionable summaries and insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TranscriptInput 
                onSummarize={handleSummarize} 
                isLoading={loading}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Analyzing your transcript...</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <SummaryCard 
                result={result} 
                transcript={transcript}
                onSaved={handleSaved}
              />
            )}

            {!result && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Your summary will appear here</p>
                  <p className="text-sm">Paste a transcript and click "Generate Summary" to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// Helper functions to extract structured data from summary
function extractKeyPoints(summary) {
  // Try to extract bullet points or numbered items
  const lines = summary.split('\n')
  const keyPoints = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Match bullet points, dashes, or numbered items
    if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      keyPoints.push(trimmed.replace(/^[-•*\d.]\s+/, ''))
    }
  }
  
  return keyPoints.length > 0 ? keyPoints : null
}

function extractTasks(summary) {
  // Try to extract action items or tasks
  const taskKeywords = ['task', 'action', 'todo', 'follow-up', 'next step', 'assign']
  const lines = summary.split('\n')
  const tasks = []
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (taskKeywords.some(keyword => lowerLine.includes(keyword))) {
      const trimmed = line.trim().replace(/^[-•*\d.]\s+/, '')
      if (trimmed.length > 10) { // Only add substantial tasks
        tasks.push({
          title: trimmed,
          priority: lowerLine.includes('high') ? 'High' : 
                   lowerLine.includes('urgent') ? 'High' : 
                   lowerLine.includes('low') ? 'Low' : 'Medium'
        })
      }
    }
  }
  
  return tasks.length > 0 ? tasks : null
}
