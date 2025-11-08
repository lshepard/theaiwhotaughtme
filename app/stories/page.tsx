'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TimeSlot {
  start_time: string;
  end_time: string;
  invitees_remaining: number;
}

export default function SubmitStoryPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grades, setGrades] = useState('');
  const [phone, setPhone] = useState('');
  const [story, setStory] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleStep1Next = async () => {
    setError('');

    // Validate required fields
    if (!name.trim() || !school.trim() || !grades.trim() || !phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Fetch available time slots
    setIsLoading(true);
    try {
      const response = await fetch('/api/calendly/availability');
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();
      setAvailableSlots(data.slots.slice(0, 6)); // Get first 6 slots
      setStep(2);
    } catch (err) {
      setError('Failed to load available times. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSlot = async (slot: TimeSlot) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/calendly/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: slot.start_time,
          end_time: slot.end_time,
          name,
          phone,
          school,
          grades,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      setSelectedSlot(slot);
      setStep(3);
    } catch (err) {
      setError('Failed to book this time. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story,
          name,
          phone,
          school,
          grades,
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

  const handleSkipStory = () => {
    setSubmitSuccess(true);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
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
              All Set!
            </h1>
            {selectedSlot && (
              <div className="mb-6 p-4 bg-cyan-50 rounded-lg inline-block">
                <p className="text-sm font-semibold text-[#1a4a5a] mb-1">Your appointment is scheduled for:</p>
                <p className="text-lg font-bold text-[#e89523]">{formatTime(selectedSlot.start_time)}</p>
              </div>
            )}
            <p className="text-lg text-gray-700 mb-8">
              We look forward to talking with you. You should receive a calendar invitation shortly.
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

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#1a4a5a] dark:text-cyan-100 mb-3">
                Tell Us About Yourself
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's start with some basic information
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#e89523] to-[#d98520] p-1 rounded-xl shadow-2xl">
              <div className="bg-white dark:bg-[#1a4a5a] rounded-lg p-8">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Teacher Name <span className="text-[#e89523]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="school"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      School <span className="text-[#e89523]">*</span>
                    </label>
                    <input
                      type="text"
                      id="school"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      placeholder="School name"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="grades"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Grades <span className="text-[#e89523]">*</span>
                    </label>
                    <input
                      type="text"
                      id="grades"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      placeholder="e.g., 3rd-5th, High School, K-12"
                      value={grades}
                      onChange={(e) => setGrades(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-2"
                    >
                      Phone <span className="text-[#e89523]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] dark:bg-white dark:text-gray-900"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={isLoading}
                  className="mt-8 w-full bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#e89523]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading Available Times...' : 'Next: Choose a Time to Talk →'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Choose Time Slot */}
      {step === 2 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#1a4a5a] dark:text-cyan-100 mb-3">
                Choose a Time to Talk
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select a time that works best for you
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a4a5a] rounded-xl shadow-2xl p-8">
              <div className="space-y-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleBookSlot(slot)}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-[#e89523]/10 hover:to-[#d98520]/10 border-2 border-gray-200 hover:border-[#e89523] rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[#1a4a5a] group-hover:text-[#e89523] transition-colors">
                          {formatTime(slot.start_time)}
                        </p>
                      </div>
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-[#e89523] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 w-full py-3 px-4 text-gray-600 hover:text-[#1a4a5a] font-medium transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Optional Story */}
      {step === 3 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#1a4a5a] dark:text-cyan-100 mb-3">
                One More Thing... (Optional)
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Want to share your story with us before we talk?
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a4a5a] rounded-xl shadow-2xl p-8">
              <form onSubmit={handleStorySubmit}>
                <label
                  htmlFor="story"
                  className="block text-lg font-semibold text-[#1a4a5a] dark:text-cyan-100 mb-3"
                >
                  Your Story (Optional)
                </label>
                <textarea
                  id="story"
                  rows={10}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e89523] focus:border-[#e89523] resize-none dark:bg-white dark:text-gray-900"
                  placeholder="Tell us about your experience with AI in the classroom... (You can also wait to share this during our conversation)"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={handleSkipStory}
                    className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-3 px-6 rounded-lg font-bold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Story'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
