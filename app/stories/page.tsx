'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

interface SchoolSuggestion {
  name: string;
  fullAddress: string;
}

export default function SubmitStoryPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [grades, setGrades] = useState('');
  const [role, setRole] = useState('');
  const [aiUsage, setAiUsage] = useState('');
  const [phone, setPhone] = useState('');
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

    // Submit form to database
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          school,
          grades,
          role,
          phone,
          aiUsage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit your story');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit your story. Please try again.');
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


  if (submitSuccess) {
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
              Thank You!
            </h1>
            <p className="text-lg text-cyan-100 mb-8">
              Your story has been submitted successfully. We'll review it and get back to you soon about scheduling an interview.
            </p>
            <div className="mb-8">
              <Link
                href="/schedule"
                className="inline-block bg-gradient-to-r from-accent to-accent-dark text-white px-8 py-3 rounded-lg font-semibold hover:from-accent-dark hover:to-accent-darker transition-all shadow-lg mr-4"
              >
                Schedule Interview
              </Link>
              <Link
                href="/"
                className="inline-block bg-white/10 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Return Home
              </Link>
            </div>
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
              How Are You Using AI in Your Classroom?
            </h1>
            <div className="text-lg md:text-xl text-cyan-50 space-y-4 drop-shadow-md">
              <p className="font-semibold text-cyan-200 text-xl md:text-2xl">
                Everyone has an opinion about AI in schools. We want yours.
              </p>
              <p>
                I'm Luke Shepard, an engineer, edtech enthusiast, and robotics coach. I run this podcast
                to better understand what works and what doesn't with AI use in schools. In the last year,
                we have covered research and news on what works, dug into AI tools like MagicSchool, Brisk,
                and SparkSpace, and gone deep into the offerings of the major LLM providers.
                </p>
                <p>
                 There's no shortage of{' '}
                <a href="https://cdt.org/insights/hand-in-hand-schools-embrace-of-ai-connected-to-increased-risks-to-students/" className="underline hover:text-white transition-colors">reports</a>,{' '}
                <a href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/bade/documents/products-and-services/en-us/education/2025-Microsoft-AI-in-Education-Report.pdf" className="underline hover:text-white transition-colors">surveys</a>,{' '}
                and <a href="https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1647573/full" className="underline hover:text-white transition-colors">papers</a>{' '}
                written about the use of AI in schools. But I want to hear from <b>you</b>.
              </p>
              <p>
                If you are a K-12 teacher, then I want to hear from <b>you!</b>
                How are you using AI in your classroom? What have you tried? What’s working, what’s not working with AI in your classroom? What are you excited about? What worries you? 
                Come on the show and share your story.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action - Invitation to Join */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent via-[#ea9726] to-accent-dark">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Come Share Your Story on the Show
          </h2>
          <div className="text-lg md:text-xl space-y-4 opacity-95 mb-8">
            <p className="font-semibold">
              Whether you're excited about AI tools or concerned about privacy and authenticity, we want to hear your perspective.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-6 border-2 border-white/30">
            <p className="text-2xl font-bold mb-2">Thank You Gift</p>
            <p className="text-xl">
              Teachers who join us for an interview will receive a <span className="font-bold text-yellow-200">$50 gift card</span> to your favorite store as our thanks for sharing your time and expertise.
            </p>
          </div>
          <p className="text-lg mb-8 opacity-90">
            Ready to share? Fill out the form below to schedule your interview.
          </p>
          <div className="inline-block">
            <svg
              className="w-12 h-12 mx-auto animate-bounce text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Form Section */}
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
                  disabled={isSubmitting}
                  className="mt-8 w-full bg-gradient-to-r from-accent to-accent-dark text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-accent-dark hover:to-accent-darker transition-all shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Your Story'}
                </button>
              </div>
            </div>
          </div>
        </section>

    </div>
  );
}
