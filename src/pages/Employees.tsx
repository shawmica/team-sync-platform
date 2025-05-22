
import { Layout } from "@/components/Layout";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

const employees = [
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
  {
    id: "4",
    name: "James Taylor",
    position: "Frontend Developer",
    department: "Engineering",
    email: "james.taylor@example.com",
    taskCount: 6,
    skills: ["React", "CSS", "JavaScript"],
    availability: "offline" as const,
  },
];

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEmployees = employees.filter(
    employee => employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
               employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage and view all team members</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.id} {...employee} />
        ))}
      </div>
    </Layout>
  );
}
