import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ContactSubmission } from '../lib/supabase';
import { Mail, Calendar, Building, Phone, CheckCircle, Circle, LogOut, Trash2, Eye, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchSubmissions();
      fetchMonthlyUsage();
    }
  }, [profile]);

  const fetchSubmissions = async () => {
    if (!profile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('user_id', profile.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const fetchMonthlyUsage = async () => {
    if (!profile) return;

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('monthly_usage')
      .select('submission_count')
      .eq('user_id', profile.id)
      .eq('month', currentMonth.toISOString().split('T')[0])
      .maybeSingle();

    setMonthlyCount(data?.submission_count || 0);
  };

  const toggleRead = async (submission: ContactSubmission) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ is_read: !submission.is_read })
      .eq('id', submission.id);

    if (!error) {
      setSubmissions(submissions.map(s =>
        s.id === submission.id ? { ...s, is_read: !s.is_read } : s
      ));
      if (selectedSubmission?.id === submission.id) {
        setSelectedSubmission({ ...selectedSubmission, is_read: !submission.is_read });
      }
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubmissions(submissions.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ notes })
      .eq('id', id);

    if (!error) {
      setSubmissions(submissions.map(s =>
        s.id === id ? { ...s, notes } : s
      ));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, notes });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = submissions.filter(s => !s.is_read).length;
  const usagePercentage = profile ? (monthlyCount / profile.monthly_submission_limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Contact Form Dashboard</h1>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{submissions.length}</p>
              </div>
              <Mail className="w-12 h-12 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{unreadCount}</p>
              </div>
              <Eye className="w-12 h-12 text-orange-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {monthlyCount}/{profile?.monthly_submission_limit}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-80" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercentage >= 90 ? 'bg-red-600' : usagePercentage >= 70 ? 'bg-orange-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 capitalize">
              {profile?.subscription_tier} Plan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Submissions</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No submissions yet
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''
                    } ${!submission.is_read ? 'border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">{submission.name}</p>
                          {!submission.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{submission.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(submission.submitted_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSubmission ? 'Submission Details' : 'Select a submission'}
              </h2>
            </div>
            <div className="p-6">
              {selectedSubmission ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedSubmission.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedSubmission.submitted_at)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRead(selectedSubmission)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={selectedSubmission.is_read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {selectedSubmission.is_read ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSubmission(selectedSubmission.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${selectedSubmission.email}`} className="hover:text-blue-600">
                        {selectedSubmission.email}
                      </a>
                    </div>

                    {selectedSubmission.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${selectedSubmission.phone}`} className="hover:text-blue-600">
                          {selectedSubmission.phone}
                        </a>
                      </div>
                    )}

                    {selectedSubmission.company && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building className="w-4 h-4 text-gray-500" />
                        {selectedSubmission.company}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedSubmission.message}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block font-medium text-gray-900 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={selectedSubmission.notes || ''}
                      onChange={(e) => updateNotes(selectedSubmission.id, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Add private notes about this submission..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Select a submission to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
