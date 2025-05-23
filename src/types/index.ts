
// Employee types
export type EmployeeAvailability = "available" | "busy" | "offline";

export interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  skills?: string[];
  availability?: EmployeeAvailability;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface EmployeeCardProps {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  skills: string[];
  taskCount: number;
  availability: EmployeeAvailability;
  avatar_url?: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  dueDate?: string;
  teamMembers: Array<{
    name: string;
    avatar?: string;
    initials: string;
  }>;
  taskStats: {
    total: number;
    completed: number;
  };
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  project?: {
    id: string;
    name: string;
  };
}

// Settings types
export interface UserSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  created_at?: string;
  updated_at?: string;
}

// Reports types
export interface TaskCompletionData {
  name: string;
  completed: number;
  pending: number;
}

export interface EmployeePerformanceData {
  name: string;
  tasks: number;
  efficiency: number;
}

export interface ProjectProgressData {
  name: string;
  Website: number;
  Mobile: number;
  Database: number;
  [key: string]: number | string;
}

export interface ReportMetrics {
  totalTasks: number;
  completionRate: number;
  activeProjects: number;
  completedProjects: number;
  previousTotalTasks?: number;
  previousCompletionRate?: number;
}
