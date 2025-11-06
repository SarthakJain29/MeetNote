'use client'
import { useEffect, useState } from "react";
import { Calendar, FileText, Loader2 } from "lucide-react";

export const MeetingHistory = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMeetings(data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">
            No meetings saved yet. Start by analyzing your first transcript!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div 
          key={meeting.id} 
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {meeting.title || "Untitled Meeting"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(meeting.created_at)}
                </div>
              </div>
              {meeting.tasks && Array.isArray(meeting.tasks) && meeting.tasks.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {meeting.tasks.length} {meeting.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {meeting.summary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
