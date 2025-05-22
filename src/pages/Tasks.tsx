
import { Layout } from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock data with correct type constraints
const tasks = [
  {
    id: "1",
    title: "Update user authentication system",
    description: "Implement new security measures in the login system",
    priority: "high" as const,
    status: "in-progress" as const,
    dueDate: "May 28",
    assignee: {
      name: "Sarah Johnson",
      initials: "SJ",
    },
    projectName: "System Security",
  },
  {
    id: "2",
    title: "Create new dashboard wireframes",
    description: "Design mockups for the analytics dashboard",
    priority: "medium" as const,
    status: "todo" as const,
    dueDate: "May 30",
    assignee: {
      name: "Alex Chen",
      initials: "AC",
    },
    projectName: "Dashboard Redesign",
  },
  {
    id: "3",
    title: "Prepare quarterly report",
    description: "Compile Q2 data for management review",
    priority: "high" as const,
    status: "review" as const,
    dueDate: "May 25",
    assignee: {
      name: "Michael Roberts",
      initials: "MR",
    },
    projectName: "Quarterly Reports",
  },
  {
    id: "4",
    title: "Fix checkout page bug",
    description: "Address issue with payment processing on mobile",
    priority: "medium" as const,
    status: "in-progress" as const,
    dueDate: "May 26",
    assignee: {
      name: "Jessica Wong",
      initials: "JW",
    },
    projectName: "E-commerce Platform",
  },
];

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTasks.map((task) => (
          <TaskCard 
            key={task.id} 
            {...task} 
            onClick={() => navigate(`/tasks/${task.id}`)}
          />
        ))}
      </div>
    </Layout>
  );
}
