import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { Task } from '../../types';

export function Calendar() {
  const { auth } = useAuth();
  const { tasks } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const scheduledTasks = useMemo(() => {
    if (!auth.user) return [];
    
    return tasks.filter(task => 
      task.scheduledDate && 
      (task.assigneeId === auth.user.id || 
       task.creatorId === auth.user.id ||
       (auth.user.organizationId && task.organizationId === auth.user.organizationId))
    );
  }, [tasks, auth.user]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getTasksForDate = (day: number): Task[] => {
    if (!day) return [];
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledTasks.filter(task => task.scheduledDate === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const todaysSchedule = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return scheduledTasks
      .filter(task => task.scheduledDate === todayStr)
      .sort((a, b) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }, [scheduledTasks]);

  if (!auth.user) {
    return <div>Please log in to view calendar.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View your scheduled tasks</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map(day => (
            <div key={day} className="px-3 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const tasksForDay = getTasksForDate(day || 0);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors ${
                  !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                } ${isToday(day || 0) ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    
                    <div className="space-y-1">
                      {tasksForDay.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border ${getPriorityColor(task.priority)} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                          title={`${task.title}${task.scheduledTime ? ` at ${task.scheduledTime}` : ''} - ${task.priority} priority`}
                        >
                          <div className="flex items-center">
                            {task.scheduledTime && (
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                            )}
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      
                      {tasksForDay.length > 3 && (
                        <div className="text-xs text-gray-500 p-1 bg-gray-100 rounded">
                          +{tasksForDay.length - 3} more task{tasksForDay.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        </div>
        
        <div className="p-6">
          {todaysSchedule.length > 0 ? (
            <div className="space-y-3">
              {todaysSchedule.map(task => (
                <div key={task.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    {task.scheduledTime ? (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <div className="flex items-center mt-1 space-x-3">
                      {task.scheduledTime && (
                        <span className="text-sm text-blue-600 font-medium">
                          {task.scheduledTime}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled tasks today</h3>
              <p className="mt-1 text-sm text-gray-500">You have a clear schedule for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}