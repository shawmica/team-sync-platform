
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { Task } from "@/types";

type TaskDetailProps = {
  isNew?: boolean;
};

export default function TaskDetail({ isNew = false }: TaskDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "review" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string>("");

  // Fetch task details if not a new task
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load task details");
        throw error;
      }

      return data as Task;
    },
    enabled: !!id && !isNew,
  });

  // Fetch all projects for the dropdown
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");

      if (error) {
        toast.error("Failed to load projects");
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  // Set form values when task data is loaded
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus((task.status as any) || "todo");
      setPriority((task.priority as any) || "medium");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
      setProjectId(task.project_id || "");
    }
  }, [task]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      status: string;
      priority: string;
      description?: string;
      due_date?: string;
      project_id?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      navigate("/tasks");
    },
    onError: (error) => {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title?: string;
      status?: "todo" | "in-progress" | "review" | "done";
      priority?: "low" | "medium" | "high";
      description?: string;
      due_date?: string;
      project_id?: string;
    }) => {
      if (!id) throw new Error("Task ID is required for update");

      const { data, error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update task");
      console.error("Error updating task:", error);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Task ID is required for deletion");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      navigate("/tasks");
    },
    onError: (error) => {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    },
  });

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title) {
      toast.error("Task title is required");
      return;
    }

    // Prepare data
    const taskData = {
      title,
      status,
      priority,
      description: description || undefined,
      due_date: dueDate || undefined,
      project_id: projectId || undefined,
    };

    // Create or update task
    if (isNew) {
      createTaskMutation.mutate(taskData);
    } else {
      updateTaskMutation.mutate(taskData);
    }
  };

  // Delete handler with confirmation
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  // Status change handler (separate for quick updates)
  const handleStatusChange = (newStatus: "todo" | "in-progress" | "review" | "done") => {
    setStatus(newStatus);
    
    if (!isNew && id) {
      updateTaskMutation.mutate({ status: newStatus });
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Link to="/tasks" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to tasks
          </Link>
        </div>
        <h1 className="text-3xl font-bold">
          {isNew ? "Create New Task" : isLoadingTask ? "Loading Task..." : title || "Task Details"}
        </h1>
      </div>

      {isLoadingTask && !isNew ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={(val) => handleStatusChange(val as any)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Task description"
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    {!isNew && (
                      <Button 
                        type="button" 
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteTaskMutation.isPending}
                      >
                        {deleteTaskMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Task"
                        )}
                      </Button>
                    )}
                    <div className="space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate("/tasks")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isNew ? createTaskMutation.isPending : updateTaskMutation.isPending}
                      >
                        {isNew ? (
                          createTaskMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Task"
                          )
                        ) : (
                          updateTaskMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isNew && task?.created_at && (
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(task.created_at), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
                
                {dueDate && (
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(dueDate), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
                
                {projectId && projects && (
                  <div>
                    <p className="text-sm font-medium">Project</p>
                    <p className="text-sm text-muted-foreground">
                      {projects.find(p => p.id === projectId)?.name || "Unknown project"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
