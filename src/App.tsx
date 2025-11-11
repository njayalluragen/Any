import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { ContactForm } from './components/ContactForm';
import { LayoutDashboard, Settings as SettingsIcon, FileText } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'settings'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : (
        <>
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-600 text-sm font-medium text-gray-900"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === 'form'
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Preview Form
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === 'settings'
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'form' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Preview</h2>
                  <p className="text-gray-600">This is how your contact form will appear on your website</p>
                </div>
                <ContactForm userId={profile.id} />
              </div>
            )}
            {activeTab === 'settings' && <Settings />}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
