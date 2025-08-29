import React, { useState } from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { TaskList } from './components/tasks/TaskList';
import { Calendar } from './components/calendar/Calendar';
import { TeamManagement } from './components/organization/TeamManagement';
import { Settings } from './components/settings/Settings';
import { Sidebar } from './components/layout/Sidebar';
import { useAuth } from './hooks/useAuth';

function App() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!auth.isAuthenticated) {
    return <AuthForm onSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />;
        case 'tasks':
          return <TaskList />;
        case 'calendar':
          return <Calendar />;
        case 'team':
          return <TeamManagement />;
        case 'settings':
          return <Settings />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please try refreshing the page or contact support.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;