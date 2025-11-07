'use client';

import Link from 'next/link';

export default function TeacherCTA() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-[#e89523] via-[#ea9726] to-[#d98520]">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Are You a Teacher Using AI?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Share your story and help other educators discover new possibilities.
          We'd love to hear how you're using AI in your classroom.
        </p>
        <Link
          href="/stories"
          className="inline-block bg-white text-[#e89523] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Share Your Story
        </Link>
        <p className="mt-4 text-sm opacity-75">
          Selected stories receive a gift card as a thank you
        </p>
      </div>
    </section>
  );
}
