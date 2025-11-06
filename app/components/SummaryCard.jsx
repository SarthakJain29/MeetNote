'use client'
import { useState } from "react";
import { CheckCircle2, Clock, User, Save } from "lucide-react";

export const SummaryCard = ({ result, transcript, onSaved }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    if (priorityLower === "high") return "bg-red-100 text-red-800 border-red-200";
    if (priorityLower === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (priorityLower === "low") return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || "Untitled Meeting",
          transcript,
          summary: result.summary,
          tasks: result.tasks || [],
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setTitle("");
      if (onSaved) onSaved();
      alert("Meeting saved successfully!");
    } catch (error) {
      console.error("Error saving meeting:", error);
      alert("Failed to save meeting. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Meeting Summary</h2>
          <p className="text-sm text-gray-500 mt-1">AI-generated overview of the discussion</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>

          {result.keyPoints && result.keyPoints.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900">Key Points</h4>
              <ul className="space-y-2">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Items Card */}
      {result.tasks && result.tasks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Action Items</h2>
            <p className="text-sm text-gray-500 mt-1">Tasks extracted from the meeting</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {result.tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-gray-900">{task.title || task}</p>
                    {task.assignee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        {task.assignee}
                      </div>
                    )}
                  </div>
                  {task.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Meeting Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Save Meeting</h2>
          <p className="text-sm text-gray-500 mt-1">Give this meeting a title and save it to your history</p>
        </div>
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Meeting title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save to History
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
