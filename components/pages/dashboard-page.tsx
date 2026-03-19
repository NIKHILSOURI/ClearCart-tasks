"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/lib/query";
import { StatCard } from "@/components/stat-card";
import { TASK_STATUSES } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { relativeTime } from "@/lib/format";

const palette = ["#60a5fa", "#818cf8", "#c084fc", "#fb7185", "#fbbf24", "#34d399", "#94a3b8"];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { projects, tasks, activity } = useDashboardData();
  const projectCount = projects.data?.length ?? 0;
  const taskCount = tasks.data?.length ?? 0;
  const inProgress = tasks.data?.filter((t) => t.status === "in_progress").length ?? 0;
  const blocked = tasks.data?.filter((t) => t.blocked || t.status === "blocked").length ?? 0;
  const delayed = tasks.data?.filter((t) => t.delayed || t.status === "delayed").length ?? 0;
  const done = tasks.data?.filter((t) => t.status === "done").length ?? 0;

  const statusData = TASK_STATUSES.map((status) => ({
    name: status,
    value: tasks.data?.filter((t) => t.status === status).length ?? 0,
  }));

  const upcoming = [...(tasks.data ?? [])]
    .filter((task) => task.due_date && task.status !== "done")
    .sort((a, b) => new Date(a.due_date ?? "").getTime() - new Date(b.due_date ?? "").getTime())
    .slice(0, 6);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Projects" value={projectCount} />
        <StatCard title="Total Tasks" value={taskCount} />
        <StatCard title="In Progress" value={inProgress} tone="warning" />
        <StatCard title="Blocked" value={blocked} tone="danger" />
        <StatCard title="Delayed" value={delayed} tone="warning" />
        <StatCard title="Done" value={done} tone="success" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" radius={8} fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-xl bg-white/5" />
            )}
          </CardContent>
        </Card>
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Workload Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={palette[i % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-xl bg-white/5" />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-slate-400">No upcoming due dates.</p>}
            {upcoming.map((task) => (
              <div key={task.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-slate-400">{task.assigned_name}</p>
                <p className="text-xs text-indigo-300">Due {task.due_date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card py-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(activity.data ?? []).slice(0, 8).map((row) => (
              <div key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-medium">{row.action}</p>
                <p className="text-xs text-slate-400">by {row.actor_name}</p>
                <p className="text-xs text-slate-500">{relativeTime(row.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
