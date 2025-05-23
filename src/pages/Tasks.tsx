
import { Layout } from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

// Define type for task data
type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  due_date: string;
  user_id: string;
  project_id?: string;
  project_name?: string;  // Added to store project name if available
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchTasks = async () => {
    if (!user) throw new Error("User not authenticated");
    
    // Fetch tasks without trying to join with projects
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // If we have tasks and any have project_id, fetch project names separately
    const tasks = data as Task[];
    const projectIds = tasks
      .filter(task => task.project_id)
      .map(task => task.project_id);
    
    if (projectIds.length > 0) {
      // Get unique project IDs
      const uniqueProjectIds = [...new Set(projectIds)].filter(Boolean) as string[];
      
      // Fetch projects data
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', uniqueProjectIds);
      
      if (!projectsError && projectsData) {
        // Create a map of project_id -> project_name
        const projectMap = projectsData.reduce((map, project) => {
          map[project.id] = project.name;
          return map;
        }, {} as Record<string, string>);
        
        // Add project names to tasks
        tasks.forEach(task => {
          if (task.project_id && projectMap[task.project_id]) {
            task.project_name = projectMap[task.project_id];
          }
        });
      } else {
        console.error("Error fetching projects:", projectsError);
      }
    }
    
    return tasks;
  };
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load tasks");
      console.error("Error fetching tasks:", error);
    }
  }, [error]);

  const filteredTasks = tasks?.filter(
    task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Format task data for TaskCard
  const formatTaskForDisplay = (task: Task) => {
    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      assignee: {
        name: "Unassigned",
        initials: "U",
      },
      projectName: task.project_name,
    };
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track all your tasks</p>
        </div>
        <Button onClick={() => navigate("/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                {...formatTaskForDisplay(task)} 
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">
                {searchQuery ? "No tasks found matching your search." : "No tasks yet. Click 'Create Task' to get started!"}
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
