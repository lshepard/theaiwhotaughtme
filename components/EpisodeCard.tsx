'use client';

import { Episode } from '@/types/episode';
import Image from 'next/image';
import { useState } from 'react';

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format duration to readable format (just minutes)
  const formatDuration = (duration: string) => {
    if (!duration) return '';

    // Convert to string if it's a number
    const durationStr = String(duration);

    let totalSeconds: number;

    // If it's already in HH:MM:SS or MM:SS format, parse it
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':').map(p => parseInt(p, 10));
      if (parts.length === 3) {
        // HH:MM:SS
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // MM:SS
        totalSeconds = parts[0] * 60 + parts[1];
      } else {
        return durationStr;
      }
    } else {
      // If it's in seconds (number only)
      totalSeconds = parseInt(durationStr, 10);
      if (isNaN(totalSeconds)) return durationStr;
    }

    // Round to nearest minute
    const minutes = Math.round(totalSeconds / 60);

    if (minutes === 1) {
      return '1 minute';
    } else {
      return `${minutes} minutes`;
    }
  };

  // Strip HTML tags from description for display, preserving line breaks
  const stripHtml = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')           // Convert <br> to newline
      .replace(/<\/p><p>/gi, '\n\n')           // Convert paragraph breaks to double newline
      .replace(/<\/div><div>/gi, '\n')         // Convert div breaks to newline
      .replace(/<[^>]*>/g, '')                 // Strip remaining HTML tags
      .trim();
  };

  return (
    <div className="bg-white dark:bg-[#1a3a4a] rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:shadow-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Episode artwork */}
          {episode.imageUrl && (
            <div className="flex-shrink-0">
              <Image
                src={episode.imageUrl}
                alt={episode.title}
                width={120}
                height={120}
                className="rounded-lg ring-2 ring-cyan-500/20"
              />
            </div>
          )}

          {/* Episode info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-2 text-primary dark:text-cyan-100">
              {episode.title}
            </h3>
            <p className="text-sm text-teal-600 dark:text-cyan-400 mb-3">
              {formatDate(episode.pubDate)}
              {episode.duration && ` • ${formatDuration(episode.duration)}`}
            </p>
            <div>
              <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-3'} mb-2`}>
                {stripHtml(episode.description)}
              </p>
              {episode.description && stripHtml(episode.description).length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-teal-600 dark:text-cyan-400 text-sm font-semibold hover:underline"
                >
                  {isExpanded ? 'Less' : 'More'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Audio player */}
        {episode.audioUrl && (
          <audio
            controls
            className="w-full mt-4"
            preload="metadata"
          >
            <source src={episode.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
}
