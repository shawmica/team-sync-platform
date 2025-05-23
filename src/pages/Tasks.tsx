
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
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchTasks = async () => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
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
  const formatTaskForDisplay = (task: any) => {
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
      projectName: task.projects?.name,
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
