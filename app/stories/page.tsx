'use client';

import { useState } from 'react';
import Link from 'next/link';

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
      <div className="min-h-screen bg-gradient-to-br from-[#1a4a5a] via-[#0d1f26] to-[#1a4a5a]">
        {/* Navigation Header */}
        <nav className="bg-[#1a4a5a]/80 backdrop-blur-sm border-b border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-[#e89523]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-white font-bold text-lg">The AI Who Taught Me</span>
            </Link>
          </div>
        </nav>

        <div className="flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8 text-center">
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
          <h1 className="text-3xl font-bold text-[#1a4a5a] mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-700">
            Your story has been submitted successfully. We appreciate you sharing your experience with us.
          </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a4a5a] via-[#0d1f26] to-[#1a4a5a]">
      {/* Navigation Header */}
      <nav className="bg-[#1a4a5a]/80 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <svg className="w-6 h-6 text-[#e89523]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-white font-bold text-lg">The AI Who Taught Me</span>
          </Link>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#e89523] via-[#ea9726] to-[#d98520] px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Share Your Story
            </h1>
            <p className="text-white/90">
              We'd love to hear about your teaching experience with AI.
            </p>
          </div>
          <div className="p-8">

          {/* Step 1: Story Submission */}
          {step === 1 && (
            <div>
              <label
                htmlFor="story"
                className="block text-sm font-medium text-[#1a4a5a] mb-2"
              >
                Your Story
              </label>
              <textarea
                id="story"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-transparent resize-none"
                placeholder="Share your experience with AI in the classroom..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
              />

              <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-sm text-[#1a4a5a]">
                  By submitting your story, you agree that it may be shared publicly (first name only).{' '}
                  <a href="#" className="text-[#e89523] hover:underline font-medium">
                    Privacy Policy
                  </a>
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="mt-6 w-full bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e89523] focus:ring-offset-2"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Story Preview */}
              <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#1a4a5a] uppercase tracking-wide">Your Story</h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#e89523] hover:text-[#d98520] text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <p className="text-[#1a4a5a] whitespace-pre-wrap text-sm leading-relaxed">
                  {story}
                </p>
              </div>

              <h3 className="text-lg font-semibold text-[#1a4a5a] mb-4">Contact Information</h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#1a4a5a] mb-1"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-transparent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1a4a5a] mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#1a4a5a] mb-1"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-transparent"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium text-[#1a4a5a] mb-1"
                  >
                    School
                  </label>
                  <input
                    type="text"
                    id="school"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e89523] focus:border-transparent"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>

                <p className="text-sm text-[#1a4a5a]/70 italic">
                  * At least one of Email or Phone is required
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full bg-gradient-to-r from-[#e89523] to-[#d98520] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#d98520] hover:to-[#c87619] transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e89523] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit My Story'}
              </button>
            </form>
          )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
