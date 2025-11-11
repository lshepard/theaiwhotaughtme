'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

interface TimeSlot {
  start_time: string;
  end_time: string;
  invitees_remaining: number;
}

interface SchoolSuggestion {
  name: string;
  fullAddress: string;
}

export default function SubmitStoryPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [grades, setGrades] = useState('');
  const [role, setRole] = useState('');
  const [aiUsage, setAiUsage] = useState('');
  const [phone, setPhone] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<SchoolSuggestion[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [gradesSuggestions, setGradesSuggestions] = useState<string[]>([]);
  const [showGradesSuggestions, setShowGradesSuggestions] = useState(false);
  const [allGrades, setAllGrades] = useState<string[]>([]);

  // Load roles from CSV on mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetch('/roles.csv');
        const text = await response.text();
        // Parse CSV and remove BOM if present, filter empty lines
        const roles = text
          .replace(/^\uFEFF/, '') // Remove BOM
          .split('\n')
          .map(role => role.trim())
          .filter(role => role.length > 0);
        setAllRoles(roles);
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    };
    loadRoles();
  }, []);

  // Load grades from CSV on mount
  useEffect(() => {
    const loadGrades = async () => {
      try {
        const response = await fetch('/grades.csv');
        const text = await response.text();
        // Parse CSV and remove BOM if present, filter empty lines
        const grades = text
          .replace(/^\uFEFF/, '') // Remove BOM
          .split('\n')
          .map(grade => grade.trim())
          .filter(grade => grade.length > 0);
        setAllGrades(grades);
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };
    loadGrades();
  }, []);

  const handleStep1Next = async () => {
    setError('');

    // Validate required fields
    if (!name.trim() || !email.trim() || !school.trim() || !aiUsage.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate phone format only if provided
    if (phone.trim()) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        setError('Please enter a valid phone number (10-15 digits).');
        return;
      }
    }

    // Fetch available time slots
    setIsLoading(true);
    try {
      const response = await fetch('/api/cal/availability');
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();
      setAvailableSlots(data.slots); // Get all slots from first 5 days
      setStep(2);
    } catch (err) {
      setError('Failed to load available times. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
    setError('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

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

  const handleSchoolChange = (value: string) => {
    setSchool(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, hide suggestions
    if (!value.trim()) {
      setSchoolSuggestions([]);
      setShowSchoolSuggestions(false);
      return;
    }

    // Debounce search - wait 300ms after user stops typing
    setIsSearchingSchools(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          setSchoolSuggestions(data.suggestions || []);
          setShowSchoolSuggestions(data.suggestions?.length > 0);
        }
      } catch (error) {
        console.error('Error fetching school suggestions:', error);
        setSchoolSuggestions([]);
      } finally {
        setIsSearchingSchools(false);
      }
    }, 300);
  };

  const handleSchoolSelect = (suggestion: SchoolSuggestion) => {
    // Store full address with city/state, not just the name
    setSchool(suggestion.fullAddress);
    setShowSchoolSuggestions(false);
    setSchoolSuggestions([]);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);

    // If empty, hide suggestions
    if (!value.trim()) {
      setRoleSuggestions([]);
      setShowRoleSuggestions(false);
      return;
    }

    // Filter roles that contain the search term (case-insensitive)
    const filtered = allRoles
      .filter(role => role.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions

    setRoleSuggestions(filtered);
    setShowRoleSuggestions(filtered.length > 0);
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setShowRoleSuggestions(false);
    setRoleSuggestions([]);
  };

  const handleGradesChange = (value: string) => {
    setGrades(value);

    // If empty, hide suggestions
    if (!value.trim()) {
      setGradesSuggestions([]);
      setShowGradesSuggestions(false);
      return;
    }

    // Filter grades that contain the search term (case-insensitive)
    const filtered = allGrades
      .filter(grade => grade.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions

    setGradesSuggestions(filtered);
    setShowGradesSuggestions(filtered.length > 0);
  };

  const handleGradesSelect = (selectedGrade: string) => {
    setGrades(selectedGrade);
    setShowGradesSuggestions(false);
    setGradesSuggestions([]);
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
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
              <h2 className="text-3xl font-bold text-primary dark:text-cyan-100 mb-3">
                Tell Us About Yourself
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's start with some basic information
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent to-accent-dark p-1 rounded-xl shadow-2xl">
              <div className="bg-white dark:bg-primary rounded-lg p-8">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                    >
                      Teacher Name <span className="text-accent">*</span>
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
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      title="Please enter a valid email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="school"
                      className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                    >
                      School <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="school"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                      placeholder="Start typing school name..."
                      value={school}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 200)}
                      onFocus={() => schoolSuggestions.length > 0 && setShowSchoolSuggestions(true)}
                      required
                      autoComplete="off"
                    />
                    {isSearchingSchools && (
                      <div className="absolute right-3 top-11 text-gray-400">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {showSchoolSuggestions && schoolSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {schoolSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSchoolSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-primary">{suggestion.name}</div>
                            <div className="text-sm text-gray-600">{suggestion.fullAddress}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="role"
                      className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                    >
                      Role (Optional)
                    </label>
                    <input
                      type="text"
                      id="role"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                      placeholder="e.g. Math Teacher, Special Education Teacher, Instructional Coach"
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                      onFocus={() => roleSuggestions.length > 0 && setShowRoleSuggestions(true)}
                      autoComplete="off"
                    />
                    {showRoleSuggestions && roleSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {roleSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleRoleSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-primary">{suggestion}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="grades"
                      className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                    >
                      Grades (Optional)
                    </label>
                    <input
                      type="text"
                      id="grades"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-white dark:text-gray-900"
                      placeholder="e.g. K-5, Middle School, 9th-12th"
                      value={grades}
                      onChange={(e) => handleGradesChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowGradesSuggestions(false), 200)}
                      onFocus={() => gradesSuggestions.length > 0 && setShowGradesSuggestions(true)}
                      autoComplete="off"
                    />
                    {showGradesSuggestions && gradesSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {gradesSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleGradesSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-primary">{suggestion}</div>
                          </button>
                        ))}
                      </div>
                    )}
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
                      placeholder="555-123-4567 or +1-555-123-4567"
                      title="Please enter a valid phone number (10-15 digits)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="aiUsage"
                      className="block text-sm font-semibold text-primary dark:text-cyan-100 mb-2"
                    >
                      How are you using AI in your classroom? <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="aiUsage"
                      rows={2}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none dark:bg-white dark:text-gray-900"
                      placeholder="Brief description..."
                      value={aiUsage}
                      onChange={(e) => setAiUsage(e.target.value)}
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
                  className="mt-8 w-full bg-gradient-to-r from-accent to-accent-dark text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-accent-dark hover:to-accent-darker transition-all shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h2 className="text-3xl font-bold text-primary dark:text-cyan-100 mb-3">
                Choose a Time to Talk
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select a time that works best for you
              </p>
            </div>

            <div className="bg-white dark:bg-primary rounded-xl shadow-2xl p-8">
              {!showConfirmation ? (
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

                  {availableSlots.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No available time slots found. Please try again later.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-6 w-full py-3 px-4 text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    ← Back
                  </button>
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
                        <div>
                          <p className="text-sm font-medium text-gray-600">School</p>
                          <p className="text-lg font-semibold text-primary">{school}</p>
                        </div>
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
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">AI Usage</p>
                          <p className="text-base font-semibold text-primary">{aiUsage}</p>
                        </div>
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
      )}
    </div>
  );
}
