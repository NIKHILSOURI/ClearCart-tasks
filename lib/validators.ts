import { z } from "zod";
import { PRIORITIES, TASK_STATUSES, UPDATE_TYPES } from "@/lib/types";

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES),
  color: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

export const taskSchema = z.object({
  project_id: z.string().uuid("Project is required"),
  title: z.string().min(2, "Task title is required"),
  description: z.string().max(2000).optional().or(z.literal("")),
  assigned_name: z.string().min(2, "Assigned name is required"),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(PRIORITIES),
  progress: z.coerce.number().min(0).max(100),
  due_date: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  blocked: z.boolean().default(false),
  delayed: z.boolean().default(false),
  blocker_reason: z.string().max(500).optional().or(z.literal("")),
  delay_reason: z.string().max(500).optional().or(z.literal("")),
});

export const taskCommentSchema = z.object({
  task_id: z.string().uuid(),
  author_name: z.string().min(2),
  comment: z.string().min(1).max(1000),
});

export const taskUpdateSchema = z.object({
  task_id: z.string().uuid(),
  update_type: z.enum(UPDATE_TYPES),
  author_name: z.string().min(2),
  message: z.string().min(1).max(1000),
});

export const subtaskSchema = z.object({
  task_id: z.string().uuid(),
  title: z.string().min(1).max(240),
});
