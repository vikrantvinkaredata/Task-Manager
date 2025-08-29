import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const STORAGE_KEY = 'task_manager_auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = (email: string, password: string): boolean => {
    // Simulate login - in real app, this would call an API
    const users = JSON.parse(localStorage.getItem('task_manager_users') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      setAuth({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string, name: string): boolean => {
    const users = JSON.parse(localStorage.getItem('task_manager_users') || '[]');
    
    if (users.some((u: User) => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role: 'employee',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('task_manager_users', JSON.stringify(users));
    
    setAuth({ user: newUser, isAuthenticated: true });
    return true;
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
  };

  const updateUser = (updatedUser: User) => {
    setAuth({ user: updatedUser, isAuthenticated: true });
    
    const users = JSON.parse(localStorage.getItem('task_manager_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex >= 0) {
      users[userIndex] = updatedUser;
      localStorage.setItem('task_manager_users', JSON.stringify(users));
    }
  };

  return { auth, login, signup, logout, updateUser };
}