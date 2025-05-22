
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "planning" | "active" | "on-hold" | "completed";
  due_date: string;
  teamMembers: {
    name: string;
    initials: string;
  }[];
  taskStats: {
    total: number;
    completed: number;
  };
}

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          // Transform data to match the ProjectCard component props
          const formattedProjects = data.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description || "",
            progress: project.progress,
            status: project.status as "planning" | "active" | "on-hold" | "completed",
            due_date: project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
            teamMembers: [], // We'll implement this in a more advanced version
            taskStats: {
              total: 0,
              completed: 0,
            },
          }));
          
          setProjects(formattedProjects);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const filteredProjects = projects.filter(
    project => project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mt-2">Create a new project to get started</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
        )
      )}
    </Layout>
  );
}
