
import { Layout } from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
  due_date: string;
  project_id?: string;
  project_name?: string;
  assignee_name?: string;
  assignee_initials?: string;
}

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id, 
            title, 
            description, 
            priority, 
            status, 
            due_date,
            project_id,
            projects(name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority as "low" | "medium" | "high",
          status: task.status as "todo" | "in-progress" | "review" | "done",
          due_date: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date',
          project_name: task.projects?.name || 'Unassigned',
          assignee_name: 'Unassigned', // We'll implement this later
          assignee_initials: 'UA',
        }));
        
        setTasks(formattedTasks);
      } catch (error: any) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const filteredTasks = tasks.filter(
    task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-muted/30 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                id={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                status={task.status === "done" ? "completed" : task.status}
                dueDate={task.due_date}
                assignee={{
                  name: task.assignee_name || 'Unassigned',
                  initials: task.assignee_initials || 'UA',
                }}
                projectName={task.project_name}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground mt-2">Create a new task to get started</p>
            <Button className="mt-4" onClick={() => navigate("/tasks/new")}>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        )
      )}
    </Layout>
  );
}
