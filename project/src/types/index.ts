export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  ownerId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  creatorId: string;
  organizationId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  timeSpent: number; // in seconds
  isTimerActive: boolean;
  timerStartTime?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  inviterName: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  createdAt: string;
}

export type UserRole = 
  | 'owner' 
  | 'ceo' 
  | 'director' 
  | 'manager' 
  | 'sales' 
  | 'purchase' 
  | 'accountant' 
  | 'employee';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  organizations: Organization[];
  tasks: Task[];
  invitations: Invitation[];
  users: User[];
}