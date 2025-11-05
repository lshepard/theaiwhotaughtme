import Image from 'next/image';

export default function Hero() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Photo placeholder - replace with actual image */}
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-6xl font-bold">
          LK
        </div>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            The AI Who Taught Me
          </h1>
          <div className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              <strong>Why This Podcast Exists:</strong>
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
        </div>
      </div>
    </section>
  );
}
