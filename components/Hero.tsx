import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background.png"
          alt="AI in the classroom"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a4a5a]/95 via-[#1a4a5a]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            The AI Who Taught Me
          </h1>
          <div className="text-lg md:text-xl text-cyan-50 space-y-4 drop-shadow-md">
            <p className="font-semibold text-cyan-200">
              Why This Podcast Exists:
            </p>
            <p>
              Artificial intelligence is transforming education in profound ways. But the most
              important stories aren't about the technology itself—they're about the teachers
              who are using it to make a real difference in their students' lives.
            </p>
            <p>
              This podcast captures those stories. Real teachers, real classrooms, real impact.
              Each episode explores how educators are thoughtfully integrating AI tools to
              enhance learning, save time, and unlock new possibilities for their students.
            </p>
          </div>

          {/* Subscribe buttons */}
          <div className="mt-8 flex gap-4 items-center">
            <p className="text-cyan-200 font-semibold mr-2">Listen on:</p>
            <a
              href="https://podcasts.apple.com/us/podcast/the-ai-who-taught-me/id1812449450"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
              aria-label="Listen on Apple Podcasts"
            >
              <Image
                src="/images/apple-podcast.png"
                alt="Apple Podcasts"
                width={48}
                height={48}
                className="rounded-full"
              />
            </a>
            <a
              href="https://open.spotify.com/show/0PgjkL4jKvzPDyTX8tMa02"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
              aria-label="Listen on Spotify"
            >
              <Image
                src="/images/spotify.png"
                alt="Spotify"
                width={48}
                height={48}
                className="rounded-full"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
