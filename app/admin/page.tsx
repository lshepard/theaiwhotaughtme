'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import type { Story, StoryStatus } from '@/lib/db';

export default function AdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoryStatus | 'all' | 'needs_action'>('needs_action');

  const fetchStoriesWithCredentials = useCallback(async (credentials: string) => {
    try {
      setLoading(true);
      setError('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/admin/stories', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Invalid credentials, remove cookie
        Cookies.remove('admin_auth');
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
      console.error('Auto-login error:', err);
      // Don't show error on auto-login failure, just stay logged out
      Cookies.remove('admin_auth');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing auth cookie on page load
  useEffect(() => {
    const authCookie = Cookies.get('admin_auth');
    if (authCookie) {
      // Auto-authenticate using stored credentials
      fetchStoriesWithCredentials(authCookie);
    }
  }, [fetchStoriesWithCredentials]);

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
        Cookies.remove('admin_auth');
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

      // Store credentials in cookie for 7 days
      Cookies.set('admin_auth', credentials, { expires: 7, secure: true, sameSite: 'strict' });
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

  const getStatusBadgeColor = (status: StoryStatus) => {
    switch (status) {
      case 'initial':
        return 'bg-gray-100 text-gray-800';
      case 'sent_for_interview':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: StoryStatus) => {
    switch (status) {
      case 'initial':
        return 'Initial';
      case 'sent_for_interview':
        return 'Sent for Interview';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const filteredStories = stories.filter((story) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'needs_action') {
      return story.status !== 'completed';
    }
    return story.status === statusFilter;
  });

  const handleMarkAsCompleted = async (storyId: number) => {
    if (!confirm('Mark this story as completed?')) {
      return;
    }

    try {
      const authCookie = Cookies.get('admin_auth');
      if (!authCookie) {
        setError('Not authenticated');
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${authCookie}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        Cookies.remove('admin_auth');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update story status');
      }

      // Update the story in local state
      setStories(stories.map(story =>
        story.id === storyId ? { ...story, status: 'completed' as StoryStatus } : story
      ));
      setSuccessMessage('Story marked as completed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating story status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update story status');
    }
  };

  const handleDelete = async (storyId: number) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const authCookie = Cookies.get('admin_auth');
      if (!authCookie) {
        setError('Not authenticated');
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${authCookie}`,
        },
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        Cookies.remove('admin_auth');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete story');
      }

      // Remove the story from the local state
      setStories(stories.filter(story => story.id !== storyId));
    } catch (err) {
      console.error('Error deleting story:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    }
  };

  const handleApprove = async (storyId: number) => {
    if (!confirm('Send approval email to this teacher?')) {
      return;
    }

    setApprovingId(storyId);
    setError('');
    setSuccessMessage('');

    try {
      const authCookie = Cookies.get('admin_auth');
      if (!authCookie) {
        setError('Not authenticated');
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/admin/stories/${storyId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authCookie}`,
        },
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        Cookies.remove('admin_auth');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send approval');
      }

      const data = await response.json();

      // Update the story status in local state
      setStories(stories.map(story =>
        story.id === storyId ? { ...story, status: 'sent_for_interview' as StoryStatus } : story
      ));

      setSuccessMessage(`Approval email sent successfully to story #${storyId}`);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error approving story:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve story');
    } finally {
      setApprovingId(null);
    }
  };

  if (!isAuthenticated) {
    // Show loading spinner during initial auth check
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

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
              Cookies.remove('admin_auth');
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

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('needs_action')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'needs_action'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Needs Action
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('initial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'initial'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Initial
          </button>
          <button
            onClick={() => setStatusFilter('sent_for_interview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'sent_for_interview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sent for Interview
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'scheduled'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {stories.length === 0 ? 'No stories submitted yet.' : 'No stories match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {story.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(story.status)}`}>
                        {getStatusLabel(story.status)}
                      </span>
                    </div>
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
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(story.id)}
                      disabled={approvingId === story.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingId === story.id ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approve & Email
                        </>
                      )}
                    </button>
                    <Link
                      href={`/schedule?id=${story.public_id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Interview
                    </Link>
                    {story.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkAsCompleted(story.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
