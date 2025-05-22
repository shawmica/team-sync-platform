
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

const projects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Revamping the company website with modern design and improved UX",
    progress: 65,
    status: "active" as const,
    dueDate: "Jun 15",
    teamMembers: [
      { name: "Emily Davis", initials: "ED" },
      { name: "Daniel Wilson", initials: "DW" },
      { name: "Alex Chen", initials: "AC" },
      { name: "Jessica Wong", initials: "JW" },
    ],
    taskStats: {
      total: 24,
      completed: 16,
    },
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Creating a new customer-facing mobile application",
    progress: 40,
    status: "active" as const,
    dueDate: "Jul 20",
    teamMembers: [
      { name: "Michael Roberts", initials: "MR" },
      { name: "Sarah Johnson", initials: "SJ" },
      { name: "James Taylor", initials: "JT" },
    ],
    taskStats: {
      total: 32,
      completed: 12,
    },
  },
  {
    id: "3",
    name: "Database Migration",
    description: "Migrating legacy database to a new cloud-based solution",
    progress: 85,
    status: "active" as const,
    dueDate: "Jun 5",
    teamMembers: [
      { name: "Emily Davis", initials: "ED" },
      { name: "Alex Chen", initials: "AC" },
    ],
    taskStats: {
      total: 18,
      completed: 15,
    },
  },
  {
    id: "4",
    name: "Brand Identity Refresh",
    description: "Updating brand guidelines and visual identity across platforms",
    progress: 20,
    status: "planning" as const,
    dueDate: "Aug 10",
    teamMembers: [
      { name: "Daniel Wilson", initials: "DW" },
      { name: "Sophia Martinez", initials: "SM" },
    ],
    taskStats: {
      total: 12,
      completed: 3,
    },
  },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  
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

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </Layout>
  );
}
