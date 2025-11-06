'use client'
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export const TranscriptInput = ({ onSummarize, isLoading }) => {
  const [transcript, setTranscript] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim() && onSummarize) {
      onSummarize(transcript);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="transcript" className="block text-sm font-semibold text-gray-700">
          Meeting Transcript
        </label>
        <textarea
          id="transcript"
          placeholder="Paste your meeting transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-4 min-h-[300px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !transcript.trim()}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Summary
          </>
        )}
      </button>
    </form>
  );
};
