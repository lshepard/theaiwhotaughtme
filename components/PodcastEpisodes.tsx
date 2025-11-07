import { fetchEpisodes } from '@/lib/rss';
import EpisodeCard from './EpisodeCard';

export default async function PodcastEpisodes() {
  const episodes = await fetchEpisodes();

  return (
    <section className="py-16 px-4 bg-white dark:bg-[#0d1f26]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#1a4a5a] dark:text-cyan-100">
          Episodes
        </h2>

        {episodes.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No episodes available yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-6">
            {episodes.map((episode, index) => (
              <EpisodeCard key={episode.guid || index} episode={episode} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
