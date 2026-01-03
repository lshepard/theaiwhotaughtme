import { fetchEpisodes } from '@/lib/rss';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface EpisodePageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all episodes
export async function generateStaticParams() {
  const episodes = await fetchEpisodes();
  return episodes.map((episode) => ({
    slug: episode.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const episodes = await fetchEpisodes();
  const episode = episodes.find((ep) => ep.slug === params.slug);

  if (!episode) {
    return {
      title: 'Episode Not Found',
    };
  }

  return {
    title: `${episode.title} | The AI Who Taught Me`,
    description: episode.description.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: episode.title,
      description: episode.description.replace(/<[^>]*>/g, '').substring(0, 160),
      images: episode.imageUrl ? [episode.imageUrl] : [],
    },
  };
}

function formatDate(dateString: string): string {
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
}

function formatDuration(duration?: string): string {
  if (!duration) return '';

  // Convert to string if it's a number
  const durationStr = String(duration);

  // Handle HH:MM:SS or MM:SS format
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) {
      const hours = parts[0];
      const minutes = parts[1];
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
    } else if (parts.length === 2) {
      return `${parts[0]} minutes`;
    }
  }

  // Handle seconds
  const seconds = parseInt(durationStr);
  if (!isNaN(seconds)) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  }

  return durationStr;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const episodes = await fetchEpisodes();
  const episode = episodes.find((ep) => ep.slug === params.slug);

  if (!episode) {
    notFound();
  }

  const cleanDescription = stripHtml(episode.description);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back to episodes link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/#episodes"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Episodes
        </Link>
      </div>

      {/* Episode Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Episode Image */}
          {episode.imageUrl && (
            <div className="flex-shrink-0">
              <div className="relative w-full md:w-64 h-64 rounded-lg overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
                <Image
                  src={episode.imageUrl}
                  alt={episode.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Episode Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{episode.title}</h1>

            <div className="flex flex-wrap gap-4 text-gray-300 mb-6">
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(episode.pubDate)}
              </span>

              {episode.duration && (
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDuration(episode.duration)}
                </span>
              )}
            </div>

            {/* Listen On Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {episode.spotifyUrl && (
                <a
                  href={episode.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Listen on Spotify
                </a>
              )}

              {episode.applePodcastsUrl && (
                <a
                  href={episode.applePodcastsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#9333ea] hover:bg-[#a855f7] text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zM12 5.09c-1.996 0-3.636 1.64-3.636 3.637 0 1.458.863 2.727 2.09 3.318v5.682c0 .504.41.909.91.909h1.272c.5 0 .91-.405.91-.91v-5.68c1.227-.592 2.09-1.86 2.09-3.319C15.636 6.73 13.996 5.09 12 5.09zm0 1.818c1.004 0 1.818.814 1.818 1.818 0 1.004-.814 1.819-1.818 1.819-1.004 0-1.818-.815-1.818-1.819 0-1.004.814-1.818 1.818-1.818z" />
                  </svg>
                  Listen on Apple Podcasts
                </a>
              )}

              {episode.link && (
                <a
                  href={episode.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Podbean
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="mt-8 mb-8">
          <audio
            controls
            className="w-full"
            style={{
              filter: 'invert(1) hue-rotate(180deg)',
            }}
          >
            <source src={episode.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Episode Description */}
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-white mb-4">About This Episode</h2>
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {cleanDescription}
          </div>
        </div>
      </div>
    </div>
  );
}
