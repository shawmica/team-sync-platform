
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckSquare, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface TaskDetailProps {
  isNew?: boolean;
}

export default function TaskDetail({ isNew = false }: TaskDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // For new task or editing existing task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskStatus, setTaskStatus] = useState<"todo" | "in-progress" | "review" | "done">("todo");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name');
          
        if (error) throw error;
        
        if (data) setProjects(data);
      } catch (error: any) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    
    fetchProjects();
  }, []);
  
  // Fetch task data if not a new task
  useEffect(() => {
    if (!isNew && id) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setTaskTitle(data.title);
            setTaskDescription(data.description || "");
            setTaskPriority(data.priority as "low" | "medium" | "high");
            setTaskStatus(data.status as "todo" | "in-progress" | "review" | "done");
            setTaskDueDate(data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : "");
            setProjectId(data.project_id || null);
          }
        } catch (error: any) {
          toast({
            title: "Error fetching task",
            description: error.message,
            variant: "destructive"
          });
          navigate('/tasks');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTask();
    }
  }, [id, isNew, navigate]);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const taskData = {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        status: taskStatus,
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        project_id: projectId,
        user_id: user?.id,
      };
      
      let response;
      
      if (isNew) {
        response = await supabase
          .from('tasks')
          .insert([taskData])
          .select();
      } else {
        response = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', id)
          .select();
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: "Success",
        description: isNew ? "Task created successfully" : "Task updated successfully",
      });
      
      navigate('/tasks');
    } catch (error: any) {
      toast({
        title: "Error saving task",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPriorityBadge = (priority: "low" | "medium" | "high") => {
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

  const renderStatusBadge = (status: "todo" | "in-progress" | "review" | "done") => {
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

  if (loading && !isNew) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={taskPriority} 
                      onValueChange={(value) => setTaskPriority(value as "low" | "medium" | "high")}
                      disabled={loading}
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
                      onValueChange={(value) => setTaskStatus(value as "todo" | "in-progress" | "review" | "done")}
                      disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select 
                      value={projectId || ""} 
                      onValueChange={(value) => setProjectId(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => navigate("/tasks")} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading || !taskTitle.trim()}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {isNew ? "Create Task" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {!isNew && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Task Info</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <span>{renderPriorityBadge(taskPriority)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span>{renderStatusBadge(taskStatus)}</span>
                  </div>
                  {taskDueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(taskDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {projectId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <span className="font-medium">
                        {projects.find(p => p.id === projectId)?.name || 'Unknown Project'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
