'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface TimeSlot {
  start_time: string;
  end_time: string;
  invitees_remaining: number;
}

function SchedulePageContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState('');
  const [grades, setGrades] = useState('');
  const [aiUsage, setAiUsage] = useState('');

  // Fetch story data if id is provided
  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) {
      const fetchStory = async () => {
        try {
          const response = await fetch(`/api/stories/${id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.story) {
              const story = data.story;
              setName(story.name || '');
              setEmail(story.email || '');
              setPhone(story.phone || '');
              setSchool(story.school || '');
              setRole(story.role || '');
              setGrades(story.grades || '');
              setAiUsage(story.story || '');
            }
          }
        } catch (error) {
          console.error('Error fetching story:', error);
        }
      };
      fetchStory();
    } else if (searchParams) {
      // Fallback to query params if no id
      setName(searchParams.get('name') || '');
      setEmail(searchParams.get('email') || '');
      setPhone(searchParams.get('phone') || '');
      setSchool(searchParams.get('school') || '');
      setRole(searchParams.get('role') || '');
      setGrades(searchParams.get('grades') || '');
      setAiUsage(searchParams.get('aiUsage') || '');
    }
  }, [searchParams]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch available slots on mount
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cal/availability');
        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }
        const data = await response.json();
        setAvailableSlots(data.slots);
      } catch (err) {
        setError('Failed to load available times. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
    setError('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    // Validate required fields
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required to book an appointment.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/cal/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          name,
          email,
          phone,
          school,
          role,
          grades,
          aiUsage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error:', errorData);
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      setSubmitSuccess(true);
      setShowConfirmation(false);
    } catch (err: any) {
      setError(err.message || 'Failed to book this time. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
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

  const formatDayHeader = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeOnly = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const groupSlotsByDay = (slots: TimeSlot[]) => {
    const grouped: { [key: string]: TimeSlot[] } = {};

    slots.forEach(slot => {
      const date = new Date(slot.start_time);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(slot);
    });

    return grouped;
  };

  const generateCalendarUrls = (slot: TimeSlot) => {
    const title = 'Teacher Interview - The AI Who Taught Me';
    const description = 'Discussion about AI usage in the classroom with The AI Who Taught Me podcast.';
    const location = 'Video call (details in confirmation email)';

    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);

    // Format for different calendar services
    const startFormatted = startTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endFormatted = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '');

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
      office365: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
      yahoo: `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(title)}&st=${startFormatted}&et=${endFormatted}&desc=${encodeURIComponent(description)}&in_loc=${encodeURIComponent(location)}`,
      ics: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${startFormatted}%0ADTEND:${endFormatted}%0ASUMMARY:${encodeURIComponent(title)}%0ADESCRIPTION:${encodeURIComponent(description)}%0ALOCATION:${encodeURIComponent(location)}%0AEND:VEVENT%0AEND:VCALENDAR`,
    };
  };

  if (submitSuccess) {
    const calendarUrls = selectedSlot ? generateCalendarUrls(selectedSlot) : null;

    return (
      <div className="min-h-screen bg-primary">
        <Navigation />

        {/* Success Message */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-accent"
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
            <h1 className="text-4xl font-bold text-white mb-4">
              All Set!
            </h1>
            {selectedSlot && (
              <div className="mb-6 p-4 bg-white/10 border-2 border-accent rounded-lg inline-block">
                <p className="text-sm font-semibold text-cyan-100 mb-1">Your appointment is scheduled for:</p>
                <p className="text-lg font-bold text-accent">{formatTime(selectedSlot.start_time)}</p>
              </div>
            )}
            <p className="text-lg text-cyan-100 mb-8">
              We look forward to talking with you. You should receive a calendar invitation shortly.
            </p>

            {/* Add to Calendar Links */}
            {calendarUrls && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-cyan-100 mb-4">Add to your calendar:</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={calendarUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-cyan-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Google Calendar
                  </a>
                  <a
                    href={calendarUrls.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-cyan-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Outlook
                  </a>
                  <a
                    href={calendarUrls.office365}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-cyan-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Office 365
                  </a>
                  <a
                    href={calendarUrls.ics}
                    download="interview.ics"
                    className="px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-cyan-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Apple Calendar
                  </a>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-accent to-accent-dark text-white px-8 py-3 rounded-lg font-semibold hover:from-accent-dark hover:to-accent-darker transition-all shadow-lg"
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
      <Navigation />

      {/* Header */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#f5f5f5] to-white dark:from-[#0d1f26] dark:to-[#1a4a5a]/20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-cyan-100 mb-3">
              Schedule Your Interview
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a time that works best for you
            </p>
          </div>

          {/* User Information Display */}
          {searchParams?.get('id') && (name || email || school || role || grades) && (
            <div className="bg-white dark:bg-primary rounded-xl shadow-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-primary dark:text-cyan-100 mb-6 text-center">
                Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {name && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">Name</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{name}</p>
                  </div>
                )}
                {email && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">Email</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{email}</p>
                  </div>
                )}
                {school && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">School</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{school}</p>
                  </div>
                )}
                {role && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">Role</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{role}</p>
                  </div>
                )}
                {grades && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">Grades</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{grades}</p>
                  </div>
                )}
                {phone && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#1a4a5a]/30 dark:to-[#0d1f26]/50 p-4 rounded-lg border-2 border-gray-200 dark:border-cyan-800/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-cyan-300 mb-1">Phone</p>
                    <p className="text-lg font-semibold text-primary dark:text-cyan-100">{phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info Form (if not provided via query params) */}
          {(!name || !email) && (
            <div className="bg-white dark:bg-primary rounded-xl shadow-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-primary dark:text-cyan-100 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                  >
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                  >
                    Email <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                    placeholder="your.email@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                    placeholder="555-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time Slots */}
          <div className="bg-white dark:bg-primary rounded-xl shadow-2xl p-8">
            {!showConfirmation ? (
              <>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Loading available times...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {Object.entries(groupSlotsByDay(availableSlots)).map(([dayKey, daySlots]) => (
                        <div key={dayKey}>
                          <h3 className="text-xl font-bold text-primary dark:text-cyan-100 mb-3">
                            {formatDayHeader(daySlots[0].start_time)}
                          </h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {daySlots.map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => handleSelectSlot(slot)}
                                className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-accent hover:to-accent-dark border-2 border-gray-200 hover:border-accent rounded-lg text-center transition-all hover:text-white font-semibold text-primary hover:scale-105"
                              >
                                {formatTimeOnly(slot.start_time)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {availableSlots.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No available time slots found. Please try again later.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Confirmation Dialog */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-primary dark:text-cyan-100 mb-2">
                      Confirm Your Appointment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Please review your details before booking
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-lg font-semibold text-primary">{name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-lg font-semibold text-primary">{email}</p>
                      </div>
                      {phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Phone</p>
                          <p className="text-lg font-semibold text-primary">{phone}</p>
                        </div>
                      )}
                      {school && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">School</p>
                          <p className="text-lg font-semibold text-primary">{school}</p>
                        </div>
                      )}
                      {role && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Role</p>
                          <p className="text-lg font-semibold text-primary">{role}</p>
                        </div>
                      )}
                      {grades && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Grades</p>
                          <p className="text-lg font-semibold text-primary">{grades}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t-2 border-accent/30">
                      <p className="text-sm font-medium text-gray-600 mb-1">Appointment Time</p>
                      <p className="text-xl font-bold text-accent">
                        {selectedSlot && formatTime(selectedSlot.start_time)}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmation(false);
                        setSelectedSlot(null);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      ← Back to Times
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-accent to-accent-dark text-white py-3 px-6 rounded-lg font-bold hover:from-accent-dark hover:to-accent-darker transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0d1f26]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SchedulePageContent />
    </Suspense>
  );
}

