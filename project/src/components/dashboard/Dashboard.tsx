import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Plus,
  AlertTriangle,
  Target
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { TaskCard } from '../tasks/TaskCard';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { Button } from '../common/Button';

export function Dashboard() {
  const { auth } = useAuth();
  const { tasks, users, organizations } = useAppData();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const userOrganization = useMemo(() => 
    organizations.find(org => org.id === auth.user?.organizationId),
    [organizations, auth.user?.organizationId]
  );

  const userTasks = useMemo(() => {
    if (!auth.user) return [];
    return tasks.filter(task => 
      task.assigneeId === auth.user.id || 
      task.creatorId === auth.user.id
    );
  }, [tasks, auth.user?.id]);

  const todaysTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return userTasks.filter(task => 
      task.scheduledDate === today || 
      (task.dueDate && task.dueDate.split('T')[0] === today)
    );
  }, [userTasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return userTasks.filter(task => 
      task.status !== 'completed' &&
      task.dueDate && 
      new Date(task.dueDate) < today
    );
  }, [userTasks]);

  const taskStats = useMemo(() => {
    return {
      total: userTasks.length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
      pending: userTasks.filter(task => task.status === 'todo').length,
      overdue: overdueTasks.length,
    };
  }, [userTasks, overdueTasks]);

  const totalTimeSpent = useMemo(() => {
    const totalSeconds = userTasks.reduce((sum, task) => sum + task.timeSpent, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [userTasks]);

  const completionRate = useMemo(() => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.completed / taskStats.total) * 100);
  }, [taskStats]);

  if (!auth.user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {auth.user.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {userOrganization 
                ? `${userOrganization.name} • ${auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1)}`
                : 'Ready to manage your tasks?'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="text-blue-100">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <CheckSquare className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-orange-600">{taskStats.inProgress}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-purple-600">{totalTimeSpent}</p>
            </div>
            <Target className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              You have {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateTask(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {todaysTasks.length > 0 ? (
            <div className="space-y-4">
              {todaysTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks scheduled for today</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Create a new task or schedule existing ones for today.
              </p>
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
        </div>
        
        <div className="p-6">
          {userTasks.length > 0 ? (
            <div className="space-y-4">
              {userTasks
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Start by creating your first task to get organized.
              </p>
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  );
}