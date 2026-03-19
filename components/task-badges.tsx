import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, string> = {
    backlog: "bg-slate-500/20 text-slate-200",
    todo: "bg-sky-500/20 text-sky-200",
    in_progress: "bg-indigo-500/20 text-indigo-200",
    in_review: "bg-violet-500/20 text-violet-200",
    blocked: "bg-rose-500/20 text-rose-200",
    delayed: "bg-amber-500/20 text-amber-200",
    done: "bg-emerald-500/20 text-emerald-200",
  };
  return <Badge className={`border-0 ${map[status]}`}>{statusLabel[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    low: "bg-slate-500/20 text-slate-200",
    medium: "bg-sky-500/20 text-sky-200",
    high: "bg-orange-500/20 text-orange-200",
    urgent: "bg-rose-500/20 text-rose-200",
  };
  return <Badge className={`border-0 ${map[priority]}`}>{priority}</Badge>;
}
