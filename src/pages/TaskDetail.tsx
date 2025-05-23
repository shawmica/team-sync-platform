import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCheck, ChevronsLeft, Edit, Loader2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define the Task type
type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
  due_date: string | null;
  user_id: string | null;
  created_at?: string;
  updated_at?: string;
  projects?: {
    id: string;
    name: string;
  } | null;
};

// Define the TaskFormValues type
const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "review", "done"]),
  due_date: z.string().optional(),
  project_id: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskDetail({ isNew = false }: { isNew?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(isNew);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      due_date: "",
      project_id: "",
    },
    mode: "onChange",
  });

  const { data: task, isLoading, isError } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      if (!id) throw new Error("Task ID is required");

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          projects (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load task");
        throw error;
      }

      return data as Task;
    },
    enabled: !isNew && !!id && !!user,
    retry: false,
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
        project_id: task.projects?.id || "",
      });
    }
  }, [task, form]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const { error } = await supabase
        .from("tasks")
        .insert({
          ...data,
          user_id: user?.id,
        });

      if (error) {
        toast.error("Failed to create task");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      if (!id) throw new Error("Task ID is required");

      const { error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", id);

      if (error) {
        toast.error("Failed to update task");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
      setIsEditMode(false);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Task ID is required");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete task");
        throw error;
      }

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    if (isNew) {
      createTaskMutation.mutate(data);
    } else {
      updateTaskMutation.mutate(data);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
        project_id: task.projects?.id || "",
      });
    }
  };

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading task...
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          Failed to load task.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/tasks")}>
          <ChevronsLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>

      {isDeleteConfirmationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteConfirmationOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => deleteTaskMutation.mutate()}>
                  Delete Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h1 className="text-3xl font-bold mb-2">{isNew ? "Create Task" : "Task Details"}</h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? "Create a new task" : "View and manage task details"}
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <Card>
            <CardContent className="bg-background p-6">
              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Task title" {...field} disabled={!isEditMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Task description"
                                className="resize-none"
                                {...field}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditMode}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditMode}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="todo">Todo</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={!isEditMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="project_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Project ID" {...field} disabled={!isEditMode} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    {isEditMode ? (
                      <>
                        <Button variant="ghost" onClick={handleCancelEdit} disabled={updateTaskMutation.isLoading}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={!form.formState.isValid || updateTaskMutation.isLoading}>
                          {updateTaskMutation.isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Task"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {!isNew && (
                          <Button onClick={() => setIsEditMode(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                          </Button>
                        )}
                        {!isNew && (
                          <Button variant="destructive" onClick={() => setIsDeleteConfirmationOpen(true)}>
                            Delete Task
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {!isEditMode && task && (
        <div className="mt-12 md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Task Information</h3>
              <p className="mt-1 text-sm text-gray-500">Details about the task.</p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <Card>
              <CardContent className="bg-background p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Title:</span>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <span className="font-medium">{task.description || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <span className="font-medium">{task.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="font-medium">{task.status}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {task.projects && task.projects.name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <span className="font-medium">{task.projects.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
