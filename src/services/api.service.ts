/**
 * API Service
 * 
 * High-level service layer for API interactions.
 * Wraps the low-level API client with business logic.
 */

import api, { ApiResponse } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

// =============================================================================
// TYPES
// =============================================================================

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type Activity = Database['public']['Tables']['activities']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

// =============================================================================
// PROJECTS SERVICE
// =============================================================================

export const projectsService = {
  /**
   * Get all projects for the current user
   */
  async getAll(): Promise<ApiResponse<Project[]>> {
    logger.debug('Fetching all projects');
    return api.get<Project[]>('/projects');
  },

  /**
   * Get a single project by ID
   */
  async getById(id: string): Promise<ApiResponse<Project>> {
    logger.debug('Fetching project', { id });
    return api.get<Project>(`/projects/${id}`);
  },

  /**
   * Create a new project
   */
  async create(project: ProjectInsert): Promise<ApiResponse<Project>> {
    logger.info('Creating new project', { name: project.name });
    return api.post<Project>('/projects', project);
  },

  /**
   * Update an existing project
   */
  async update(id: string, updates: ProjectUpdate): Promise<ApiResponse<Project>> {
    logger.info('Updating project', { id, updates: Object.keys(updates) });
    return api.put<Project>(`/projects/${id}`, updates);
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    logger.info('Deleting project', { id });
    return api.delete<void>(`/projects/${id}`);
  },
};

// =============================================================================
// ACTIVITIES SERVICE
// =============================================================================

export const activitiesService = {
  /**
   * Get recent activities
   */
  async getRecent(limit = 10): Promise<ApiResponse<Activity[]>> {
    logger.debug('Fetching recent activities', { limit });
    return api.get<Activity[]>(`/activities?limit=${limit}`);
  },

  /**
   * Get activities for a specific project
   */
  async getByProject(projectId: string): Promise<ApiResponse<Activity[]>> {
    logger.debug('Fetching activities for project', { projectId });
    return api.get<Activity[]>(`/projects/${projectId}/activities`);
  },
};

// =============================================================================
// TASKS SERVICE
// =============================================================================

export const tasksService = {
  /**
   * Get all tasks for a project
   */
  async getByProject(projectId: string): Promise<ApiResponse<Task[]>> {
    logger.debug('Fetching tasks for project', { projectId });
    return api.get<Task[]>(`/projects/${projectId}/tasks`);
  },

  /**
   * Create a new task
   */
  async create(task: TaskInsert): Promise<ApiResponse<Task>> {
    logger.info('Creating new task', { title: task.title, projectId: task.project_id });
    return api.post<Task>('/tasks', task);
  },

  /**
   * Update a task
   */
  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    logger.info('Updating task', { id });
    return api.put<Task>(`/tasks/${id}`, updates);
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    logger.info('Deleting task', { id });
    return api.delete<void>(`/tasks/${id}`);
  },

  /**
   * Toggle task completion
   */
  async toggleComplete(id: string, completed: boolean): Promise<ApiResponse<Task>> {
    logger.info('Toggling task completion', { id, completed });
    return api.put<Task>(`/tasks/${id}`, {
      status: completed ? 'completed' : 'in_progress',
      completed_at: completed ? new Date().toISOString() : null,
    });
  },
};

// =============================================================================
// STATS SERVICE
// =============================================================================

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  recentActivity: Activity[];
}

export const statsService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    logger.debug('Fetching dashboard stats');
    return api.get<DashboardStats>('/stats/dashboard');
  },
};

// =============================================================================
// EXPORT ALL SERVICES
// =============================================================================

export default {
  projects: projectsService,
  activities: activitiesService,
  tasks: tasksService,
  stats: statsService,
};
