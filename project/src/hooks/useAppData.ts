import { useState, useEffect } from 'react';
import { Organization, Task, Invitation, User, UserRole, TaskStatus } from '../types';

const ORGANIZATIONS_KEY = 'task_manager_organizations';
const TASKS_KEY = 'task_manager_tasks';
const INVITATIONS_KEY = 'task_manager_invitations';
const USERS_KEY = 'task_manager_users';

export function useAppData() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const loadedOrgs = JSON.parse(localStorage.getItem(ORGANIZATIONS_KEY) || '[]');
      const loadedTasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      const loadedInvitations = JSON.parse(localStorage.getItem(INVITATIONS_KEY) || '[]');
      const loadedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

      setOrganizations(loadedOrgs);
      setTasks(loadedTasks);
      setInvitations(loadedInvitations);
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const createOrganization = (name: string, description: string, ownerId: string): Organization => {
    const newOrg: Organization = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      ownerId,
      createdAt: new Date().toISOString(),
    };

    const updatedOrgs = [...organizations, newOrg];
    setOrganizations(updatedOrgs);
    saveToStorage(ORGANIZATIONS_KEY, updatedOrgs);
    
    return newOrg;
  };

  const createTask = (taskData: Omit<Task, 'id' | 'timeSpent' | 'isTimerActive' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timeSpent: 0,
      isTimerActive: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveToStorage(TASKS_KEY, updatedTasks);
    
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>): Task | null => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    const updatedTask = { ...tasks[taskIndex], ...updates };
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    setTasks(updatedTasks);
    saveToStorage(TASKS_KEY, updatedTasks);
    
    return updatedTask;
  };

  const deleteTask = (taskId: string): boolean => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveToStorage(TASKS_KEY, updatedTasks);
    return true;
  };

  const toggleTaskTimer = (taskId: string): Task | null => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const now = Date.now();
    let updates: Partial<Task>;

    if (task.isTimerActive) {
      // Stop timer
      const additionalTime = task.timerStartTime ? Math.floor((now - task.timerStartTime) / 1000) : 0;
      updates = {
        isTimerActive: false,
        timeSpent: task.timeSpent + additionalTime,
        timerStartTime: undefined,
      };
    } else {
      // Start timer - stop all other active timers first
      const updatedTasks = tasks.map(t => 
        t.isTimerActive ? { ...t, isTimerActive: false, timerStartTime: undefined } : t
      );
      setTasks(updatedTasks);
      saveToStorage(TASKS_KEY, updatedTasks);

      updates = {
        isTimerActive: true,
        timerStartTime: now,
        status: 'in-progress' as TaskStatus,
      };
    }

    return updateTask(taskId, updates);
  };

  const completeTask = (taskId: string): Task | null => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const now = Date.now();
    let additionalTime = 0;

    if (task.isTimerActive && task.timerStartTime) {
      additionalTime = Math.floor((now - task.timerStartTime) / 1000);
    }

    const updates: Partial<Task> = {
      status: 'completed' as TaskStatus,
      isTimerActive: false,
      timeSpent: task.timeSpent + additionalTime,
      timerStartTime: undefined,
      completedAt: new Date().toISOString(),
    };

    return updateTask(taskId, updates);
  };

  const sendInvitation = (organizationId: string, email: string, role: UserRole, inviterName: string): Invitation => {
    const org = organizations.find(o => o.id === organizationId);
    if (!org) throw new Error('Organization not found');

    // Check if invitation already exists
    const existingInvitation = invitations.find(inv => 
      inv.organizationId === organizationId && 
      inv.email === email && 
      inv.status === 'pending'
    );

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    const newInvitation: Invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      organizationName: org.name,
      inviterName,
      email,
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedInvitations = [...invitations, newInvitation];
    setInvitations(updatedInvitations);
    saveToStorage(INVITATIONS_KEY, updatedInvitations);
    
    return newInvitation;
  };

  const updateUserRole = (userId: string, role: UserRole): User | null => {
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) return null;

    const updatedUser = { ...users[userIndex], role };
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    setUsers(updatedUsers);
    saveToStorage(USERS_KEY, updatedUsers);
    
    return updatedUser;
  };

  const getUsersByOrganization = (organizationId: string): User[] => {
    return users.filter(user => user.organizationId === organizationId);
  };

  const getTasksByUser = (userId: string): Task[] => {
    return tasks.filter(task => task.assigneeId === userId);
  };

  const getTasksByOrganization = (organizationId: string): Task[] => {
    return tasks.filter(task => task.organizationId === organizationId);
  };

  return {
    organizations,
    tasks,
    invitations,
    users,
    createOrganization,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskTimer,
    completeTask,
    sendInvitation,
    updateUserRole,
    getUsersByOrganization,
    getTasksByUser,
    getTasksByOrganization,
  };
}
</parameter>