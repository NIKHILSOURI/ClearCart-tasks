"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { queryKeys, useProjects, useTasks } from "@/lib/query";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { StatusBadge } from "@/components/task-badges";
import { cn } from "@/lib/utils";

function TaskCard({
  task,
  dragging = false,
}: {
  task: Task;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { type: "task" },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl border border-white/12 bg-black/25 p-3 shadow-sm transition-all duration-200 active:cursor-grabbing",
        "hover:-translate-y-0.5 hover:border-indigo-300/30 hover:bg-black/35 hover:shadow-[0_10px_25px_-15px_rgba(129,140,248,0.65)]",
        dragging && "rotate-1 border-indigo-300/45 bg-slate-900/95 shadow-2xl",
      )}
    >
      <Link href={`/tasks/${task.id}`} className="block">
        <p className="font-medium">{task.title}</p>
        <p className="text-xs text-slate-400">{task.assigned_name}</p>
      </Link>
    </div>
  );
}

function KanbanColumn({
  status,
  children,
  count,
  active,
}: {
  status: TaskStatus;
  children: React.ReactNode;
  count: number;
  active: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <motion.div
      ref={setNodeRef}
      id={status}
      layout
      className={cn(
        "rounded-2xl border bg-white/[0.04] p-3 transition-all duration-200",
        active || isOver
          ? "border-indigo-300/40 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(129,140,248,0.22),0_22px_45px_-35px_rgba(129,140,248,0.8)]"
          : "border-white/10",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium capitalize">{status.replace("_", " ")}</h3>
        <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-0.5 text-xs text-slate-300">
          {count}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

export default function TasksPage() {
  const tasks = useTasks();
  const projects = useProjects();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedName, setAssignedName] = useState("");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  useEffect(() => {
    setLocalTasks(tasks.data ?? []);
  }, [tasks.data]);

  const updateTask = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) => api.tasks.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });

  const createTask = useMutation({
    mutationFn: () =>
      api.tasks.create({
        project_id: projectId,
        title,
        assigned_name: assignedName,
        status: "todo",
        priority: "medium",
        progress: 0,
      }),
    onSuccess: async (task) => {
      await api.activities.create({
        project_id: task.project_id,
        task_id: task.id,
        action: "Task created",
        actor_name: task.assigned_name,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      setTitle("");
      setAssignedName("");
      toast.success("Task created");
    },
  });

  const filtered = useMemo(() => {
    const list = [...localTasks].filter((task) => {
      const textMatch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.assigned_name.toLowerCase().includes(search.toLowerCase());
      const assigneeMatch = assignee === "all" || task.assigned_name === assignee;
      return textMatch && assigneeMatch;
    });
    if (sortBy === "priority") {
      const rank = { low: 1, medium: 2, high: 3, urgent: 4 };
      list.sort((a, b) => rank[b.priority] - rank[a.priority]);
    } else {
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return list;
  }, [localTasks, assignee, search, sortBy]);

  const people = Array.from(new Set(localTasks.map((t) => t.assigned_name)));

  const byStatus = (status: TaskStatus) => filtered.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overStatus = event.over?.id?.toString() as TaskStatus | undefined;
    if (!overStatus || !TASK_STATUSES.includes(overStatus)) {
      setOverColumn(null);
      return;
    }
    setOverColumn(overStatus);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const taskId = event.active.id.toString();
    const overStatus = event.over?.id?.toString() as TaskStatus | undefined;
    setActiveTaskId(null);
    setOverColumn(null);
    if (!overStatus || !TASK_STATUSES.includes(overStatus)) return;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === overStatus) return;
    const previous = localTasks;
    setLocalTasks((curr) =>
      curr.map((item) =>
        item.id === taskId
          ? { ...item, status: overStatus, updated_at: new Date().toISOString() }
          : item,
      ),
    );
    try {
      await updateTask.mutateAsync({ id: task.id, payload: { status: overStatus } });
      await api.activities.create({
        project_id: task.project_id,
        task_id: task.id,
        action: `Task moved to ${overStatus}`,
        actor_name: task.assigned_name,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      toast.success(`Moved to ${overStatus.replace("_", " ")}`);
    } catch {
      setLocalTasks(previous);
      toast.error("Could not move task. Please retry.");
    }
  };

  const activeTask = activeTaskId ? localTasks.find((t) => t.id === activeTaskId) : null;

  return (
    <main className="space-y-6">
      <Card className="glass-card py-0">
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Assigned name" value={assignedName} onChange={(e) => setAssignedName(e.target.value)} />
          <Select value={projectId} onValueChange={(value) => setProjectId(value ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {(projects.data ?? []).map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!title || !projectId || !assignedName} onClick={() => createTask.mutate()}>
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card py-0">
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={assignee} onValueChange={(value) => setAssignee(value ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {people.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? "updated")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Sort by updated</SelectItem>
              <SelectItem value="priority">Sort by priority</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={() => {
              setActiveTaskId(null);
              setOverColumn(null);
            }}
            onDragEnd={onDragEnd}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {["todo", "in_progress", "in_review", "done"].map((status) => (
                <KanbanColumn
                  key={status}
                  status={status as TaskStatus}
                  count={byStatus(status as TaskStatus).length}
                  active={overColumn === status}
                >
                  <SortableContext items={byStatus(status as TaskStatus).map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {byStatus(status as TaskStatus).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </SortableContext>
                </KanbanColumn>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="w-[280px]">
                  <TaskCard task={activeTask} dragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <Card className="glass-card py-0">
            <CardContent className="space-y-2 p-4">
              {filtered.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.assigned_name}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
