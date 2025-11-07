'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SubmitStoryPage() {
  const [step, setStep] = useState(1);
  const [story, setStory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!story.trim()) {
      setError('Please write your story before continuing.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please provide either an email or phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story,
          name,
          email,
          phone,
          school,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      setSubmitSuccess(true);
    } catch (err) {
      setError('Failed to submit your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1f26]">
        {/* Navigation Header */}
        <nav className="bg-[#1a4a5a] border-b border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-[#e89523]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-white font-bold text-lg">The AI Who Taught Me</span>
            </Link>
          </div>
        </nav>

        {/* Success Message */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-[#e89523]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#1a4a5a] mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Your story has been submitted successfully. We appreciate you sharing your experience with us.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-[#e89523] to-[#d98520] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-lg"
            >
              Return Home
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1f26]">
      {/* Navigation Header */}
      <nav className="bg-[#1a4a5a] border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <svg className="w-6 h-6 text-[#e89523]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-white font-bold text-lg">The AI Who Taught Me</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
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

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              How do we use AI in schools?
            </h1>
            <div className="text-lg md:text-xl text-cyan-50 space-y-4 drop-shadow-md">
              <p className="font-semibold text-cyan-200 text-xl md:text-2xl">
                Your story matters.
              </p>
              <p>
                Whether you're experimenting with AI tools, transforming your teaching practice,
                or navigating challenges—we want to hear from you. Share your experience and help
                shape the conversation about AI in education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Form Section */}
      {step === 1 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#1a4a5a] dark:text-cyan-100 mb-3">
                Share Your Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us about your experience with AI in your classroom
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#e89523] to-[#d98520] p-1 rounded-xl shadow-2xl">
              <div className="bg-white dark:bg-[#1a4a5a] rounded-lg p-8">
                <label
                  htmlFor="story"
                  className="block text-lg font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-3"
                >
                  Your Story
                </label>
                <textarea
                  id="story"
                  rows={14}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] resize-none dark:bg-white dark:text-gray-900"
                  placeholder="Tell us your story... How are you using AI? What's working? What challenges are you facing?"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />

                <div className="mt-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                  <p className="text-sm text-[#1a4a5a] dark:text-cyan-100">
                    By submitting your story, you agree that it may be shared publicly (first name only).{' '}
                    <a href="#" className="text-[#e89523] hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </p>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-8 w-full bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#e89523]/50"
                >
                  Next: Add Your Contact Info →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Info Section */}
      {step === 2 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1a4a5a] dark:text-cyan-100 mb-3 text-center">
                Almost There!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Just need a few details to stay in touch
              </p>
            </div>

            {/* Story Preview */}
            <div className="mb-8 p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border-2 border-cyan-200 dark:border-cyan-700">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1a4a5a] dark:text-cyan-100 uppercase tracking-wide">Your Story</h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#e89523] hover:text-[#d98520] text-sm font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              <p className="text-[#1a4a5a] dark:text-cyan-50 whitespace-pre-wrap leading-relaxed">
                {story}
              </p>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-[#1a4a5a] rounded-xl shadow-2xl p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Name <span className="text-[#e89523]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="school"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      School
                    </label>
                    <input
                      type="text"
                      id="school"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    * At least one of Email or Phone is required
                  </p>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-8 w-full bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#e89523]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit My Story'}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
