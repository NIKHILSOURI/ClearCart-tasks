import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project, Task } from "@/lib/types";

export const queryKeys = {
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  tasks: ["tasks"] as const,
  tasksByProject: (id: string) => ["tasks", "project", id] as const,
  task: (id: string) => ["task", id] as const,
  comments: (id: string) => ["task-comments", id] as const,
  updates: (id: string) => ["task-updates", id] as const,
  subtasks: (id: string) => ["subtasks", id] as const,
  activity: ["activity"] as const,
  activityByProject: (id: string) => ["activity", "project", id] as const,
  activityByTask: (id: string) => ["activity", "task", id] as const,
};

export const useProjects = () =>
  useQuery({
    queryKey: queryKeys.projects,
    queryFn: api.projects.list,
  });

export const useTasks = () =>
  useQuery({
    queryKey: queryKeys.tasks,
    queryFn: api.tasks.list,
  });

export const useDashboardData = () => {
  const projects = useProjects();
  const tasks = useTasks();
  const activity = useQuery({
    queryKey: queryKeys.activity,
    queryFn: api.activities.list,
  });
  return { projects, tasks, activity };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Project>) => api.projects.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task>) => api.tasks.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
};
