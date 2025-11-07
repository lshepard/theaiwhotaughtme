import { Episode } from '@/types/episode';
import Image from 'next/image';

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
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

  // Strip HTML tags from description for display
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
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
            <h3 className="text-xl font-semibold mb-2 text-[#1a4a5a] dark:text-cyan-100">
              {episode.title}
            </h3>
            <p className="text-sm text-teal-600 dark:text-cyan-400 mb-3">
              {formatDate(episode.pubDate)}
              {episode.duration && ` • ${episode.duration}`}
            </p>
            <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
              {stripHtml(episode.description)}
            </p>
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
