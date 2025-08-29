import React, { useMemo } from 'react';
import { Bell, Clock, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { auth } = useAuth();
  const { tasks, invitations } = useAppData();

  const notifications = useMemo(() => {
    if (!auth.user) return [];

    const notifs = [];

    // Pending invitations
    const pendingInvites = invitations.filter(inv => 
      inv.email === auth.user.email && inv.status === 'pending'
    );

    pendingInvites.forEach(invite => {
      notifs.push({
        id: `invite_${invite.id}`,
        type: 'invitation',
        title: 'Team Invitation',
        message: `${invite.inviterName} invited you to join ${invite.organizationName}`,
        time: invite.createdAt,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      });
    });

    // Overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => 
      task.assigneeId === auth.user.id &&
      task.status !== 'completed' &&
      task.dueDate && 
      new Date(task.dueDate) < today
    );

    overdueTasks.forEach(task => {
      notifs.push({
        id: `overdue_${task.id}`,
        type: 'overdue',
        title: 'Overdue Task',
        message: `"${task.title}" was due ${new Date(task.dueDate!).toLocaleDateString()}`,
        time: task.dueDate!,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      });
    });

    // Due today tasks
    const todayStr = today.toISOString().split('T')[0];
    const dueTodayTasks = tasks.filter(task => 
      task.assigneeId === auth.user.id &&
      task.status !== 'completed' &&
      task.dueDate && 
      task.dueDate.split('T')[0] === todayStr
    );

    dueTodayTasks.forEach(task => {
      notifs.push({
        id: `due_${task.id}`,
        type: 'due_today',
        title: 'Due Today',
        message: `"${task.title}" is due today`,
        time: task.dueDate!,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      });
    });

    return notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [auth.user, tasks, invitations]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map(notification => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className={`w-8 h-8 ${notification.bgColor} rounded-full flex items-center justify-center mr-3 mt-1`}>
                      <Icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}