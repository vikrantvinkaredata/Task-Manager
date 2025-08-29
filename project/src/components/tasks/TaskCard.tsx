import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import { useAppData } from '../../hooks/useAppData';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { auth } = useAuth();
  const { toggleTaskTimer, completeTask, updateTask, deleteTask, users } = useAppData();
  const [currentTime, setCurrentTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const assignee = users.find(user => user.id === task.assigneeId);
  const canEdit = auth.user?.id === task.creatorId || auth.user?.id === task.assigneeId;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (task.isTimerActive && task.timerStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - task.timerStartTime!) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.isTimerActive, task.timerStartTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDisplayTime = task.isTimerActive 
    ? task.timeSpent + currentTime
    : task.timeSpent;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 border-gray-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    urgent: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const handleTimerToggle = () => {
    try {
      toggleTaskTimer(task.id);
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const handleComplete = () => {
    try {
      completeTask(task.id);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTitleEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
      isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleEdit()}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-2 mt-1">{task.description}</p>
          )}

          {assignee && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs text-blue-600 font-medium">
                  {assignee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>Assigned to {assignee.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('-', ' ')}
          </span>
          {canEdit && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Timer Display */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className="font-medium">{formatTime(totalDisplayTime)}</span>
            {task.isTimerActive && (
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center text-sm ${
              isOverdue ? 'text-red-600' : 'text-gray-600'
            }`}>
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Scheduled Time */}
          {task.scheduledDate && (
            <div className="flex items-center text-sm text-blue-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {new Date(task.scheduledDate).toLocaleDateString()}
                {task.scheduledTime && ` at ${task.scheduledTime}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Timer Button */}
          {task.status !== 'completed' && (
            <Button
              variant={task.isTimerActive ? "secondary" : "primary"}
              size="sm"
              onClick={handleTimerToggle}
              disabled={isSubmitting}
            >
              {task.isTimerActive ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}

          {/* Complete Button */}
          {task.status !== 'completed' && (
            <Button
              variant="success"
              size="sm"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}