import Hero from '@/components/Hero';
import TeacherCTA from '@/components/TeacherCTA';
import PodcastEpisodes from '@/components/PodcastEpisodes';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <TeacherCTA />
      <PodcastEpisodes />
    </main>
  );
}
