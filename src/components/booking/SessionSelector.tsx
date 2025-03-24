
import React from 'react';
import { Clock } from 'lucide-react';
import { Session } from '@/lib/types';
import { formatTime } from '@/utils/dateUtils';

interface SessionSelectorProps {
  sessions: Session[];
  selectedSession: string;
  onSessionChange: (sessionId: string) => void;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  selectedSession,
  onSessionChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-subtle border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">Select a Session</h2>
      
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} 
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedSession === session.id 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'hover:bg-secondary border-border'
            }`}
            onClick={() => onSessionChange(session.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                <span className="font-medium">{formatTime(session.time)}</span>
              </div>
              <div className="text-sm">
                <span>{session.availableSeats}</span> of <span>{session.totalSeats}</span> seats available
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionSelector;
