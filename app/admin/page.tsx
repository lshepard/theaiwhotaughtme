'use client';

import { useEffect, useState } from 'react';
import type { Story } from '@/lib/db';

export default function AdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchStories = async (user: string, pass: string) => {
    try {
      setLoading(true);
      setError('');

      const credentials = btoa(`${user}:${pass}`);

      // Add timeout to prevent hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/admin/stories', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        setError('Invalid username or password');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setStories(data.stories);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check if the server is running and try again.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error: Unable to reach the server. Is the development server running?');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Failed to fetch stories. Please try again.');
      }

      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories(username, password);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Story Submissions</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setUsername('');
              setPassword('');
              setStories([]);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No stories submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {story.name}
                    </h3>
                    <div className="mt-1 space-y-1">
                      {story.school && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">School:</span> {story.school}
                        </p>
                      )}
                      {story.grades && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Grades:</span> {story.grades}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(story.created_at)}
                  </span>
                </div>

                {story.story && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Story:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {story.story}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex gap-6">
                    {story.email && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>{' '}
                        <a
                          href={`mailto:${story.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {story.email}
                        </a>
                      </div>
                    )}
                    {story.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                        <a
                          href={`tel:${story.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {story.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  {story.verification_link && (
                    <div>
                      <span className="font-medium text-gray-700">Verification:</span>{' '}
                      <a
                        href={story.verification_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {story.verification_link}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
