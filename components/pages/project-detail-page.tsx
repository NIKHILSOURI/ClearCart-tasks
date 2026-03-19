"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { StatusBadge } from "@/components/task-badges";
import { relativeTime } from "@/lib/format";

export default function ProjectDetailPage({ projectId }: { projectId: string }) {
  const project = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.projects.get(projectId),
  });
  const tasks = useQuery({
    queryKey: queryKeys.tasksByProject(projectId),
    queryFn: () => api.tasks.byProject(projectId),
  });
  const activity = useQuery({
    queryKey: queryKeys.activityByProject(projectId),
    queryFn: () => api.activities.byProject(projectId),
  });

  const taskData = tasks.data ?? [];
  const done = taskData.filter((t) => t.status === "done").length;
  const blocked = taskData.filter((t) => t.status === "blocked" || t.blocked).length;

  return (
    <main className="space-y-6">
      <Card className="glass-card py-0">
        <CardHeader>
          <CardTitle>{project.data?.name ?? "Project"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-slate-300">{project.data?.description}</p>
          <p className="text-xs text-slate-400">Due date: {project.data?.due_date ?? "N/A"}</p>
          <div className="flex gap-2">
            <Badge>Total tasks: {taskData.length}</Badge>
            <Badge>Done: {done}</Badge>
            <Badge>Blocked: {blocked}</Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {taskData.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-slate-400">{task.assigned_name}</p>
                <div className="mt-2">
                  <StatusBadge status={task.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(activity.data ?? []).map((row) => (
              <div key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-medium">{row.action}</p>
                <p className="text-xs text-slate-400">Actor: {row.actor_name}</p>
                <p className="text-xs text-slate-500">{relativeTime(row.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
