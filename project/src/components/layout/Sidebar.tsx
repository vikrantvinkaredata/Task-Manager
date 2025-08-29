import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar,
  Settings,
  LogOut,
  Building,
  Bell
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { logout, auth } = useAuth();
  const { tasks, invitations } = useAppData();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const canAccessTeam = auth.user?.role === 'owner' || 
                       auth.user?.role === 'ceo' || 
                       auth.user?.role === 'director' || 
                       auth.user?.role === 'manager';

  // Count notifications (pending invitations + overdue tasks)
  const notificationCount = useMemo(() => {
    const pendingInvites = invitations.filter(inv => 
      inv.email === auth.user?.email && inv.status === 'pending'
    ).length;

    const overdueTasks = tasks.filter(task => {
      if (!auth.user || task.status === 'completed') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return task.assigneeId === auth.user.id && 
             task.dueDate && 
             new Date(task.dueDate) < today;
    }).length;

    return pendingInvites + overdueTasks;
  }, [invitations, tasks, auth.user]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Building className="w-8 h-8 text-blue-600" />
          <span className="ml-3 text-xl font-bold text-gray-900">TaskFlow</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {auth.user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{auth.user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{auth.user?.role}</p>
          </div>
          {notificationCount > 0 && (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">{notificationCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map(item => {
          if (item.id === 'team' && !canAccessTeam) {
            return null;
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          Settings
        </button>
        
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-1"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}