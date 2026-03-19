"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { queryKeys, useProjects, useTasks } from "@/lib/query";

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [color, setColor] = useState("#818cf8");
  const projects = useProjects();
  const tasks = useTasks();
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: () =>
      api.projects.create({ name, description, due_date: dueDate || null, color, status: "todo" }),
    onSuccess: async (project) => {
      await api.activities.create({
        project_id: project.id,
        action: "Project created",
        actor_name: "System",
        metadata: { name: project.name },
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      setName("");
      setDescription("");
      setDueDate("");
      toast.success("Project created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => api.projects.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      toast.success("Project deleted");
    },
  });

  const progressForProject = (projectId: string) => {
    const projectTasks = (tasks.data ?? []).filter((task) => task.project_id === projectId);
    if (!projectTasks.length) return 0;
    const done = projectTasks.filter((task) => task.status === "done").length;
    return Math.round((done / projectTasks.length) * 100);
  };

  return (
    <main className="space-y-6">
      <Card className="glass-card py-0">
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Textarea
            className="md:col-span-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <Button disabled={!name || createProject.isPending} onClick={() => createProject.mutate()}>
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(projects.data ?? []).map((project) => {
          const progress = progressForProject(project.id);
          return (
            <motion.div key={project.id} whileHover={{ y: -5 }}>
              <Card className="glass-card py-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{project.name}</span>
                    <span className="size-3 rounded-full" style={{ background: project.color ?? "#818cf8" }} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-slate-300">{project.description}</p>
                  <Progress value={progress} />
                  <p className="text-xs text-slate-400">Due: {project.due_date ?? "N/A"}</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-input bg-background px-2.5 text-sm"
                    >
                      Open
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => deleteProject.mutate(project.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}
