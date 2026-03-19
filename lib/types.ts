export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "delayed",
  "done",
] as const;

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const UPDATE_TYPES = [
  "progress",
  "blocker",
  "delayed",
  "done",
  "note",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof PRIORITIES)[number];
export type UpdateType = (typeof UPDATE_TYPES)[number];

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  color: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_name: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  due_date: string | null;
  start_date: string | null;
  blocked: boolean;
  delayed: boolean;
  blocker_reason: string | null;
  delay_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Subtask = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

export type TaskUpdate = {
  id: string;
  task_id: string;
  update_type: UpdateType;
  author_name: string;
  message: string;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_name: string;
  comment: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  project_id: string | null;
  task_id: string | null;
  action: string;
  actor_name: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
