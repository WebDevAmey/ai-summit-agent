import { Speaker } from '@/lib/types';
import { getSpeakerSessionCount } from '@/lib/search';
import { ExternalLink } from 'lucide-react';

interface SpeakerCardProps {
  speaker: Speaker;
  onClick: () => void;
}

export function SpeakerCard({ speaker, onClick }: SpeakerCardProps) {
  const sessionCount = getSpeakerSessionCount(speaker.name);

  return (
    <button
      onClick={onClick}
      className="glass-card p-4 text-left w-full hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
          {speaker.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors font-sans">
              {speaker.name}
            </h3>
            {speaker.profileUrl && (
              <a
                href={speaker.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{speaker.post}{speaker.company ? `, ${speaker.company}` : ''}</p>
          {sessionCount > 0 && (
            <p className="text-[10px] text-primary mt-1">{sessionCount} session{sessionCount > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </button>
  );
}
