
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckSquare, ArrowLeft, Calendar, Clock, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from 'date-fns';

interface TaskDetailProps {
  isNew?: boolean;
}

// Define task types for better type safety
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Update the interface to properly handle the potential error state
interface TaskData {
  id?: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  project_id: string | null;
  user_id: string | null;
  projects?: {
    name: string;
  } | null | { error: true };
}

export default function TaskDetail({ isNew = false }: TaskDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // State for task form with proper typing
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      if (isNew || !id) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as unknown as TaskData;
    },
    enabled: !isNew && !!id,
  });

  // Update form with fetched task data
  useEffect(() => {
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description || "");
      setTaskPriority(task.priority as TaskPriority);
      setTaskStatus(task.status as TaskStatus);
      setTaskDueDate(task.due_date ? format(parseISO(task.due_date), 'yyyy-MM-dd') : "");
      setProjectId(task.project_id);
    }
  }, [task]);

  // Create/update task mutation
  const mutation = useMutation({
    mutationFn: async (taskData: any) => {
      if (isNew) {
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select();
          
        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success(isNew ? "Task created successfully" : "Task updated successfully");
      if (isNew) navigate(`/tasks/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} task: ${error.message}`);
    }
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Task ID is required');
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      navigate('/tasks');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!taskTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    
    const taskData = {
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      status: taskStatus,
      due_date: taskDueDate || null,
      project_id: projectId,
      user_id: user?.id,
    };
    
    mutation.mutate(taskData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  const renderPriorityBadge = (priority: TaskPriority) => {
    const classes = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={classes[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const renderStatusBadge = (status: TaskStatus) => {
    const classes = {
      todo: "bg-gray-100 text-gray-800",
      "in-progress": "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      done: "bg-green-100 text-green-800",
    };
    
    const labels = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "In Review",
      done: "Completed",
    };
    
    return (
      <Badge className={classes[status]}>
        {labels[status]}
      </Badge>
    );
  };
  
  if (isLoading && !isNew) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-32 w-full bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        <h1 className="text-3xl font-bold">{isNew ? "Create New Task" : "Task Details"}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    value={taskTitle} 
                    onChange={(e) => setTaskTitle(e.target.value)} 
                    placeholder="Enter task title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={taskDescription} 
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter task description" 
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={taskPriority} 
                      onValueChange={(value: TaskPriority) => setTaskPriority(value)}
                    >
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={taskStatus} 
                      onValueChange={(value: TaskStatus) => setTaskStatus(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="done">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="dueDate" 
                        type="date" 
                        className="pl-10" 
                        value={taskDueDate} 
                        onChange={(e) => setTaskDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={projectId || "none"}
                      onValueChange={(value) => setProjectId(value === "none" ? null : value)}
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between space-x-2">
                  {!isNew && (
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Task
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={() => navigate("/tasks")}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {isNew ? "Create Task" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {!isNew && task && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Task Info</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <span>{renderPriorityBadge(task.priority as TaskPriority)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span>{renderStatusBadge(task.status as TaskStatus)}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(task.due_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {/* Check if projects exists, is not null, and has a name property */}
                  {task.projects && 
                   !('error' in task.projects) && 
                   task.projects.name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <span className="font-medium">{task.projects.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
