import { formatDistanceToNow, isBefore } from "date-fns";
import type { TaskStatus } from "@/lib/types";

export const statusLabel: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  blocked: "Blocked",
  delayed: "Delayed",
  done: "Done",
};

export function relativeTime(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function isOverdue(date: string | null) {
  if (!date) return false;
  return isBefore(new Date(date), new Date());
}
