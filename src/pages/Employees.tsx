
import { Layout } from "@/components/Layout";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Briefcase } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define type for employee data
type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar?: string;
  taskCount: number;
  skills?: string[];
  availability?: "available" | "busy" | "offline";
};

// Define the form schema for creating a new employee
const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  skills: z.string().optional(),
  availability: z.enum(["available", "busy", "offline"]),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      position: "",
      department: "",
      skills: "",
      availability: "available",
    },
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data: employeesData, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");
        
      if (error) {
        toast.error("Failed to load employees");
        throw error;
      }

      // For each employee, get their task count
      const employeesWithTaskCount = await Promise.all(
        employeesData.map(async (employee) => {
          const { count, error: taskError } = await supabase
            .from("task_assignments")
            .select("*", { count: "exact", head: true })
            .eq("employee_id", employee.id);

          if (taskError) {
            console.error("Error fetching tasks for employee:", taskError);
          }

          return {
            ...employee,
            taskCount: count || 0,
          };
        })
      );

      return employeesWithTaskCount;
    },
    enabled: !!user,
  });

  const filteredEmployees = employees.filter(
    employee => 
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function onSubmit(data: EmployeeFormValues) {
    try {
      // Convert skills string to array
      const skillsArray = data.skills ? 
        data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : 
        [];

      // Insert the new employee into Supabase
      const { data: newEmployee, error } = await supabase
        .from("employees")
        .insert({
          name: data.name,
          email: data.email,
          position: data.position,
          department: data.department,
          skills: skillsArray.length > 0 ? skillsArray : null,
          availability: data.availability,
          user_id: user?.id, // Associate with current user if needed
        })
        .select();

      if (error) {
        toast.error("Failed to add employee");
        throw error;
      }

      // Invalidate the employees query to refetch data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");

      // Close the dialog and reset form
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage and view all team members</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
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
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} {...employee} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {searchQuery ? "No employees found matching your search." : "No employees yet. Click 'Add Employee' to get started!"}
            </p>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new team member
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email address" 
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Skills (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
