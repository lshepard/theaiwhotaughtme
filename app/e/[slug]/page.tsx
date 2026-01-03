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

function cleanHtmlForDisplay(html: string): string {
  // Preserve links and basic formatting while cleaning up HTML
  return html
    .replace(/<br\s*\/?>/gi, '<br />')
    .replace(/<\/p>/gi, '</p>')
    .trim();
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const episodes = await fetchEpisodes();
  const episode = episodes.find((ep) => ep.slug === params.slug);

  if (!episode) {
    notFound();
  }

  const cleanDescription = cleanHtmlForDisplay(episode.description);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1f26]">
      {/* Back to episodes link */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/#episodes"
          className="inline-flex items-center text-teal-600 dark:text-cyan-400 hover:text-teal-700 dark:hover:text-cyan-300 transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 py-12">
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
            <h1 className="text-4xl font-bold text-primary dark:text-cyan-100 mb-4">{episode.title}</h1>

            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-6">
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-teal-600 dark:text-cyan-400"
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
                    className="w-5 h-5 mr-2 text-teal-600 dark:text-cyan-400"
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
              {episode.link && (
                <a
                  href={episode.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
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
          >
            <source src={episode.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Episode Description */}
        <div className="max-w-none">
          <h2 className="text-2xl font-bold text-primary dark:text-cyan-100 mb-4">About This Episode</h2>
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed [&_a]:text-teal-600 [&_a]:dark:text-cyan-400 [&_a]:underline [&_a]:hover:text-teal-700 [&_a]:dark:hover:text-cyan-300"
            dangerouslySetInnerHTML={{ __html: cleanDescription }}
          />
        </div>
      </div>
    </div>
  );
}
