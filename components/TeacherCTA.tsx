'use client';

import Link from 'next/link';

export default function TeacherCTA() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-accent via-[#ea9726] to-accent-dark">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Are You a Teacher Using AI?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Whether you love it or have concerns about it—we want to hear your story.
          Share what's actually working (or not working) in your classroom.
        </p>
        <Link
          href="/stories"
          className="inline-block bg-white text-accent px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Share Your Story
        </Link>
        <p className="mt-4 text-base opacity-90">
          Teachers who join us for an interview receive a <span className="font-bold text-yellow-200">$50 gift card</span> as thanks
        </p>
      </div>
    </section>
  );
}
