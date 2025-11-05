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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                className="rounded-lg"
              />
            </div>
          )}

          {/* Episode info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {episode.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
