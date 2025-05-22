
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { TaskCard } from "@/components/TaskCard";
import { EmployeeCard } from "@/components/EmployeeCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Users,
  FolderKanban,
  Clock,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// Mock data with correct type constraints
const recentTasks = [
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

const topEmployees = [
  {
    id: "1",
    name: "Emily Davis",
    position: "Senior Developer",
    department: "Engineering",
    email: "emily.davis@example.com",
    taskCount: 8,
    skills: ["React", "Node.js", "TypeScript"],
    availability: "available" as const,
  },
  {
    id: "2",
    name: "Daniel Wilson",
    position: "UI/UX Designer",
    department: "Design",
    email: "daniel.wilson@example.com",
    taskCount: 5,
    skills: ["Figma", "UI Design", "Prototyping"],
    availability: "busy" as const,
  },
  {
    id: "3",
    name: "Sophia Martinez",
    position: "Project Manager",
    department: "Operations",
    email: "sophia.martinez@example.com",
    taskCount: 12,
    skills: ["Agile", "Team Leadership", "Jira"],
    availability: "available" as const,
  },
];

const activeProjects = [
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
];

export default function Index() {
  const [taskView, setTaskView] = useState("all");
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's an overview of your organization.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Tasks"
          value="248"
          description="21 added this week"
          icon={<CheckSquare className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value="24"
          description="3 joined this month"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value="12"
          description="2 completed this month"
          icon={<FolderKanban className="h-6 w-6" />}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Overdue Tasks"
          value="8"
          description="2 more than last week"
          icon={<Clock className="h-6 w-6" />}
          trend={{ value: 25, isPositive: false }}
        />
      </div>
      
      {/* Tasks Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Tasks</h2>
          <Button variant="link" className="text-sm text-muted-foreground" asChild>
            <a href="/tasks">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="mb-4">
            <TabsTrigger value="all" onClick={() => setTaskView("all")}>All</TabsTrigger>
            <TabsTrigger value="my" onClick={() => setTaskView("my")}>My Tasks</TabsTrigger>
            <TabsTrigger value="todo" onClick={() => setTaskView("todo")}>To Do</TabsTrigger>
            <TabsTrigger value="in-progress" onClick={() => setTaskView("in-progress")}>In Progress</TabsTrigger>
            <TabsTrigger value="review" onClick={() => setTaskView("review")}>In Review</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="my" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentTasks.slice(0, 2).map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="todo" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentTasks.filter(task => task.status === 'todo').map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="in-progress" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentTasks.filter(task => task.status === 'in-progress').map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="review" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentTasks.filter(task => task.status === 'review').map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Section - Projects and Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Active Projects</h2>
            <Button variant="link" className="text-sm text-muted-foreground" asChild>
              <a href="/projects">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
        
        {/* Team Members Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Performing Employees</h2>
            <Button variant="link" className="text-sm text-muted-foreground" asChild>
              <a href="/employees">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="space-y-4">
            {topEmployees.map((employee) => (
              <EmployeeCard key={employee.id} {...employee} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

