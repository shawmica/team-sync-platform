
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define type for project data
type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "planning" | "active" | "on-hold" | "completed";
  due_date?: string;
  teamMembers: Array<{
    name: string;
    avatar?: string;
    initials: string;
  }>;
  taskStats: {
    total: number;
    completed: number;
  };
};

// Define the form schema for creating a new project
const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on-hold", "completed"]),
  dueDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      dueDate: "",
    },
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load projects");
        throw error;
      }

      // For each project, get task statistics and members
      const projectsWithDetails = await Promise.all(
        data.map(async (project) => {
          // Get task statistics
          const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("status")
            .eq("project_id", project.id);

          const taskStats = {
            total: tasks?.length || 0,
            completed: tasks?.filter((task) => task.status === "done").length || 0,
          };

          if (tasksError) {
            console.error("Error fetching tasks for project:", tasksError);
          }

          // Get team members
          const { data: members, error: membersError } = await supabase
            .from("project_members")
            .select("employee_id, employees(name)")
            .eq("project_id", project.id);

          let teamMembers = [];
          
          if (!membersError && members) {
            teamMembers = members.map((member) => {
              const name = member.employees?.name || "Unknown";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("");
              
              return {
                name,
                initials,
              };
            });
          }

          return {
            ...project,
            teamMembers,
            taskStats,
          };
        })
      );

      return projectsWithDetails;
    },
    enabled: !!user,
  });

  const filteredProjects = projects.filter(
    (project) => 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function onSubmit(data: ProjectFormValues) {
    try {
      // Insert the new project into Supabase
      const { data: newProject, error } = await supabase
        .from("projects")
        .insert({
          name: data.name,
          description: data.description || "",
          status: data.status,
          due_date: data.dueDate || null,
          progress: 0, // New projects start at 0% progress
        })
        .select();

      if (error) {
        toast.error("Failed to create project");
        throw error;
      }

      // Invalidate the projects query to refetch data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");

      // Close the dialog and reset form
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
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

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {searchQuery ? "No projects found matching your search." : "No projects yet. Click 'Create Project' to get started!"}
            </p>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new project
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the project" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
