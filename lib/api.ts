import { supabase } from "@/lib/supabase";
import type {
  ActivityLog,
  Project,
  Subtask,
  Task,
  TaskComment,
  TaskUpdate,
} from "@/lib/types";

const ensure = <T>(data: T, error: { message: string } | null): T => {
  if (error) throw new Error(error.message);
  return data;
};

export const api = {
  projects: {
    list: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as Project[];
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      return ensure(data, error) as Project;
    },
    create: async (payload: Partial<Project>) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as Project;
    },
    update: async (id: string, payload: Partial<Project>) => {
      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      return ensure(data, error) as Project;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    },
  },
  tasks: {
    list: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as Task[];
    },
    byProject: async (projectId: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as Task[];
    },
    get: async (id: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
      return ensure(data, error) as Task;
    },
    create: async (payload: Partial<Task>) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as Task;
    },
    update: async (id: string, payload: Partial<Task>) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      return ensure(data, error) as Task;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    },
  },
  subtasks: {
    byTask: async (taskId: string) => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      return ensure(data ?? [], error) as Subtask[];
    },
    create: async (payload: Partial<Subtask>) => {
      const { data, error } = await supabase
        .from("subtasks")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as Subtask;
    },
    update: async (id: string, payload: Partial<Subtask>) => {
      const { data, error } = await supabase
        .from("subtasks")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      return ensure(data, error) as Subtask;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    },
  },
  comments: {
    byTask: async (taskId: string) => {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as TaskComment[];
    },
    create: async (payload: Partial<TaskComment>) => {
      const { data, error } = await supabase
        .from("task_comments")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as TaskComment;
    },
  },
  updates: {
    byTask: async (taskId: string) => {
      const { data, error } = await supabase
        .from("task_updates")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as TaskUpdate[];
    },
    create: async (payload: Partial<TaskUpdate>) => {
      const { data, error } = await supabase
        .from("task_updates")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as TaskUpdate;
    },
  },
  activities: {
    list: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return ensure(data ?? [], error) as ActivityLog[];
    },
    byProject: async (projectId: string) => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as ActivityLog[];
    },
    byTask: async (taskId: string) => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      return ensure(data ?? [], error) as ActivityLog[];
    },
    create: async (payload: Partial<ActivityLog>) => {
      const { data, error } = await supabase
        .from("activity_logs")
        .insert(payload)
        .select("*")
        .single();
      return ensure(data, error) as ActivityLog;
    },
  },
};
