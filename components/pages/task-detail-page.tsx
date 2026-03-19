"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { PRIORITIES, TASK_STATUSES, UPDATE_TYPES, type UpdateType } from "@/lib/types";
import { queryKeys } from "@/lib/query";
import { PriorityBadge, StatusBadge } from "@/components/task-badges";
import { relativeTime } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TaskDetailPage({ taskId }: { taskId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskQuery = useQuery({ queryKey: queryKeys.task(taskId), queryFn: () => api.tasks.get(taskId) });
  const subtasks = useQuery({ queryKey: queryKeys.subtasks(taskId), queryFn: () => api.subtasks.byTask(taskId) });
  const comments = useQuery({ queryKey: queryKeys.comments(taskId), queryFn: () => api.comments.byTask(taskId) });
  const updates = useQuery({ queryKey: queryKeys.updates(taskId), queryFn: () => api.updates.byTask(taskId) });
  const activity = useQuery({ queryKey: queryKeys.activityByTask(taskId), queryFn: () => api.activities.byTask(taskId) });
  const [taskForm, setTaskForm] = useState<typeof taskQuery.data>(undefined);

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [updateAuthor, setUpdateAuthor] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>("note");
  const [updateMessage, setUpdateMessage] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const saveTask = useMutation({
    mutationFn: () => api.tasks.update(taskId, taskForm ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      toast.success("Task updated");
    },
  });

  const addComment = useMutation({
    mutationFn: () => api.comments.create({ task_id: taskId, author_name: commentAuthor, comment: commentText }),
    onSuccess: async () => {
      await api.activities.create({
        project_id: taskQuery.data?.project_id,
        task_id: taskId,
        action: "Comment added",
        actor_name: commentAuthor,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityByTask(taskId) });
      setCommentAuthor("");
      setCommentText("");
    },
  });

  const addUpdate = useMutation({
    mutationFn: () =>
      api.updates.create({
        task_id: taskId,
        author_name: updateAuthor,
        update_type: updateType,
        message: updateMessage,
      }),
    onSuccess: async () => {
      await api.activities.create({
        project_id: taskQuery.data?.project_id,
        task_id: taskId,
        action: `Update added (${updateType})`,
        actor_name: updateAuthor,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.updates(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activityByTask(taskId) });
      setUpdateAuthor("");
      setUpdateMessage("");
    },
  });

  const addSubtask = useMutation({
    mutationFn: () => api.subtasks.create({ task_id: taskId, title: subtaskTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) });
      setSubtaskTitle("");
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      const current = taskForm ?? taskQuery.data;
      if (!current) return;
      await api.activities.create({
        project_id: current.project_id,
        task_id: null,
        action: "Task deleted",
        actor_name: current.assigned_name || "System",
        metadata: { deleted_task_id: current.id, title: current.title },
      });
      await api.tasks.remove(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      toast.success("Task deleted");
      router.push("/tasks");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  const completion = useMemo(() => {
    const list = subtasks.data ?? [];
    if (!list.length) return 0;
    return Math.round((list.filter((s) => s.is_completed).length / list.length) * 100);
  }, [subtasks.data]);

  const task = taskForm ?? taskQuery.data;
  if (!task) return <div className="text-sm text-slate-300">Loading task...</div>;

  return (
    <main className="space-y-6">
      <Card className="glass-card py-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <div className="flex gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input value={task.title} onChange={(e) => setTaskForm({ ...task, title: e.target.value })} />
          <Input value={task.assigned_name} onChange={(e) => setTaskForm({ ...task, assigned_name: e.target.value })} />
          <Textarea className="md:col-span-2" value={task.description ?? ""} onChange={(e) => setTaskForm({ ...task, description: e.target.value })} />
          <Select value={task.status} onValueChange={(v) => setTaskForm({ ...task, status: (v ?? task.status) as typeof task.status })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={task.priority} onValueChange={(v) => setTaskForm({ ...task, priority: (v ?? task.priority) as typeof task.priority })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" min={0} max={100} value={task.progress} onChange={(e) => setTaskForm({ ...task, progress: Number(e.target.value) })} />
          <Input type="date" value={task.due_date ?? ""} onChange={(e) => setTaskForm({ ...task, due_date: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={task.blocked} onCheckedChange={(v) => setTaskForm({ ...task, blocked: Boolean(v) })} /> Blocked</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={task.delayed} onCheckedChange={(v) => setTaskForm({ ...task, delayed: Boolean(v) })} /> Delayed</label>
          <Input placeholder="Blocker reason" value={task.blocker_reason ?? ""} onChange={(e) => setTaskForm({ ...task, blocker_reason: e.target.value })} />
          <Input placeholder="Delay reason" value={task.delay_reason ?? ""} onChange={(e) => setTaskForm({ ...task, delay_reason: e.target.value })} />
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button className="flex-1 min-w-36" onClick={() => saveTask.mutate()}>
              Save Task
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" className="flex-1 min-w-36" />
                }
              >
                Delete Task
              </DialogTrigger>
              <DialogContent className="bg-slate-900/95 border-white/10">
                <DialogHeader>
                  <DialogTitle>Delete this task?</DialogTitle>
                  <DialogDescription>
                    This will permanently remove the task, subtasks, comments, and updates.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-2">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteTask.mutate()}
                    disabled={deleteTask.isPending}
                  >
                    {deleteTask.isPending ? "Deleting..." : "Delete Permanently"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card py-0">
          <CardHeader><CardTitle>Subtasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completion} />
            <div className="flex gap-2">
              <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Add subtask" />
              <Button onClick={() => addSubtask.mutate()} disabled={!subtaskTitle}>Add</Button>
            </div>
            {(subtasks.data ?? []).map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
                <Checkbox
                  checked={subtask.is_completed}
                  onCheckedChange={async (v) => {
                    await api.subtasks.update(subtask.id, { is_completed: Boolean(v) });
                    queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) });
                  }}
                />
                <p className="text-sm">{subtask.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card py-0">
          <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} placeholder="Author name" />
            <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Comment" />
            <Button onClick={() => addComment.mutate()} disabled={!commentAuthor || !commentText}>Add Comment</Button>
            {(comments.data ?? []).map((comment) => (
              <div key={comment.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm">{comment.comment}</p>
                <p className="mt-1 text-xs text-slate-400">{comment.author_name} - {relativeTime(comment.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card py-0">
          <CardHeader><CardTitle>Updates / Checkpoints</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={updateAuthor} onChange={(e) => setUpdateAuthor(e.target.value)} placeholder="Author name" />
            <Select value={updateType} onValueChange={(v) => setUpdateType((v ?? "note") as UpdateType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{UPDATE_TYPES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} placeholder="Update message" />
            <Button onClick={() => addUpdate.mutate()} disabled={!updateAuthor || !updateMessage}>Add Update</Button>
            {(updates.data ?? []).map((update) => (
              <div key={update.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm">{update.message}</p>
                <p className="mt-1 text-xs text-slate-400">{update.update_type} by {update.author_name}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card py-0">
          <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(activity.data ?? []).map((row) => (
              <div key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm">{row.action}</p>
                <p className="text-xs text-slate-400">{row.actor_name}</p>
                <p className="text-xs text-slate-500">{relativeTime(row.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
