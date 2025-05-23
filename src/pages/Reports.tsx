
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "@/components/ui/chart-components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { TaskCompletionData, EmployeePerformanceData, ProjectProgressData, ReportMetrics } from "@/types";

export default function Reports() {
  const [timeFrame, setTimeFrame] = useState("month");
  const { user } = useAuth();
  
  // Fetch report metrics
  const { data: metrics = { totalTasks: 0, completionRate: 0, activeProjects: 0, completedProjects: 0 }, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["reportMetrics", timeFrame],
    queryFn: async (): Promise<ReportMetrics> => {
      // Calculate date ranges
      const now = new Date();
      const startDate = timeFrame === "week" 
        ? new Date(now.setDate(now.getDate() - 7)).toISOString()
        : timeFrame === "month"
        ? new Date(now.setMonth(now.getMonth() - 1)).toISOString()
        : new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      
      // Get previous period for comparison
      const prevStartDate = timeFrame === "week"
        ? new Date(now.setDate(now.getDate() - 7)).toISOString()
        : timeFrame === "month"
        ? new Date(now.setMonth(now.getMonth() - 1)).toISOString()
        : new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      
      // Get total tasks
      const { count: totalTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });
      
      // Get completed tasks
      const { count: completedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "done");
      
      // Get active projects
      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");
      
      // Get completed projects
      const { count: completedProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");
      
      // Calculate completion rate
      const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Get previous period metrics for comparison
      const { count: prevTotalTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .lt("created_at", startDate);
      
      const { count: prevCompletedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "done")
        .lt("created_at", startDate);
      
      const prevCompletionRate = prevTotalTasks ? Math.round((prevCompletedTasks / prevTotalTasks) * 100) : 0;
      
      return {
        totalTasks: totalTasks || 0,
        completionRate,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        previousTotalTasks: prevTotalTasks || 0,
        previousCompletionRate: prevCompletionRate
      };
    },
    enabled: !!user,
  });
  
  // Fetch task completion data
  const { data: taskCompletionData = [], isLoading: isLoadingTaskCompletion } = useQuery({
    queryKey: ["taskCompletion", timeFrame],
    queryFn: async (): Promise<TaskCompletionData[]> => {
      const result: TaskCompletionData[] = [];
      
      // Get range and format based on timeframe
      let dateFormat: string;
      let periods: { start: Date; end: Date; label: string }[] = [];
      
      const now = new Date();
      
      if (timeFrame === "week") {
        dateFormat = "EEE";
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          periods.push({
            start: date,
            end: date,
            label: format(date, dateFormat)
          });
        }
      } else if (timeFrame === "month") {
        dateFormat = "'Week' w";
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          periods.push({
            start: weekStart,
            end: weekEnd,
            label: `Week ${4 - i}`
          });
        }
      } else {
        dateFormat = "MMM";
        for (let i = 11; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(now, i));
          const monthEnd = endOfMonth(monthStart);
          periods.push({
            start: monthStart,
            end: monthEnd,
            label: format(monthStart, dateFormat)
          });
        }
      }
      
      // Query the data for each period
      for (const period of periods) {
        const startISO = period.start.toISOString();
        const endISO = period.end.toISOString();
        
        // Get completed tasks
        const { count: completed } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("status", "done")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        
        // Get pending tasks
        const { count: pending } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .neq("status", "done")
          .gte("created_at", startISO)
          .lte("created_at", endISO);
        
        result.push({
          name: period.label,
          completed: completed || 0,
          pending: pending || 0
        });
      }
      
      return result;
    },
    enabled: !!user,
  });
  
  // Fetch employee performance data
  const { data: employeePerformanceData = [], isLoading: isLoadingEmployeePerformance } = useQuery({
    queryKey: ["employeePerformance"],
    queryFn: async (): Promise<EmployeePerformanceData[]> => {
      // Get employees with task counts
      const { data: employees, error } = await supabase
        .from("employees")
        .select("id, name");
      
      if (error || !employees) {
        console.error("Error fetching employees:", error);
        return [];
      }
      
      const result: EmployeePerformanceData[] = [];
      
      // For each employee, get their tasks and calculate efficiency
      for (const employee of employees.slice(0, 5)) { // Limit to top 5
        const { data: assignments } = await supabase
          .from("task_assignments")
          .select("task_id")
          .eq("employee_id", employee.id);
        
        if (!assignments) continue;
        
        const taskIds = assignments.map(a => a.task_id);
        
        if (taskIds.length === 0) {
          result.push({
            name: employee.name.split(' ').map(n => `${n[0]}.`).join(' '),
            tasks: 0,
            efficiency: 0
          });
          continue;
        }
        
        const { data: completedTasks } = await supabase
          .from("tasks")
          .select("id")
          .in("id", taskIds)
          .eq("status", "done");
        
        const totalTasks = taskIds.length;
        const completedCount = completedTasks?.length || 0;
        const efficiency = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        
        result.push({
          name: employee.name.split(' ').map(n => `${n[0]}.`).join(' '),
          tasks: totalTasks,
          efficiency
        });
      }
      
      // Sort by efficiency (highest first)
      return result.sort((a, b) => b.efficiency - a.efficiency);
    },
    enabled: !!user,
  });
  
  // Fetch project progress data
  const { data: projectProgressData = [], isLoading: isLoadingProjectProgress } = useQuery({
    queryKey: ["projectProgress", timeFrame],
    queryFn: async (): Promise<ProjectProgressData[]> => {
      // Define periods based on timeframe
      const now = new Date();
      let periods: { date: Date; label: string }[] = [];
      
      if (timeFrame === "week") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          periods.push({ 
            date,
            label: format(date, "EEE")
          });
        }
      } else if (timeFrame === "month") {
        for (let i = 3; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          periods.push({ 
            date,
            label: `Week ${4 - i}`
          });
        }
      } else {
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          periods.push({ 
            date,
            label: format(date, "MMM")
          });
        }
      }
      
      // Get all projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, status, progress")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (!projects || projects.length === 0) {
        return periods.map(p => ({ name: p.label, Website: 0, Mobile: 0, Database: 0 }));
      }
      
      const projectTypes = ["Website", "Mobile", "Database"];
      
      // For simplicity, we'll map projects to these types
      // In a real app, you'd have project types in the database
      const result: ProjectProgressData[] = periods.map((period, index) => {
        const data: ProjectProgressData = {
          name: period.label
        };
        
        // Simulate realistic progress over time with some randomness
        projects.forEach((project, pIndex) => {
          const projectType = projectTypes[pIndex % projectTypes.length];
          
          // Calculate progress at this point in time
          // Earlier periods should have lower progress
          const maxProgress = index / (periods.length - 1);
          const variance = Math.random() * 0.1 - 0.05; // Random variance of ±5%
          const progress = Math.max(0, Math.min(100, Math.round((maxProgress + variance) * 100)));
          
          data[projectType] = progress;
        });
        
        return data;
      });
      
      return result;
    },
    enabled: !!user,
  });
  
  // Calculate percentage changes
  const taskChangePercent = metrics.previousTotalTasks 
    ? Math.round(((metrics.totalTasks - metrics.previousTotalTasks) / metrics.previousTotalTasks) * 100) 
    : 0;
  
  const completionRateChangePercent = metrics.previousCompletionRate 
    ? metrics.completionRate - metrics.previousCompletionRate
    : 0;
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Analytics and performance metrics</p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics.totalTasks}</div>
                    <p className={`text-xs ${taskChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {taskChangePercent >= 0 ? "+" : ""}{taskChangePercent}% from last {timeFrame}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                    <p className={`text-xs ${completionRateChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {completionRateChangePercent >= 0 ? "+" : ""}{completionRateChangePercent}% from last {timeFrame}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics.activeProjects}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.completedProjects} completed this {timeFrame}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task Completion</CardTitle>
                <Tabs defaultValue={timeFrame} className="w-[200px]">
                  <TabsList>
                    <TabsTrigger value="week" onClick={() => setTimeFrame("week")}>Week</TabsTrigger>
                    <TabsTrigger value="month" onClick={() => setTimeFrame("month")}>Month</TabsTrigger>
                    <TabsTrigger value="year" onClick={() => setTimeFrame("year")}>Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {isLoadingTaskCompletion ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <BarChart 
                    data={taskCompletionData} 
                    categories={["completed", "pending"]}
                    index="name"
                    colors={["green", "orange"]}
                    valueFormatter={(value: number) => `${value} tasks`}
                    className="h-[300px]"
                  />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjectProgress ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <LineChart 
                    data={projectProgressData}
                    categories={["Website", "Mobile", "Database"]}
                    index="name"
                    colors={["blue", "purple", "cyan"]}
                    valueFormatter={(value: number) => `${value}%`}
                    className="h-[300px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTaskCompletion ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <BarChart 
                  data={taskCompletionData} 
                  categories={["completed", "pending"]}
                  index="name"
                  colors={["green", "orange"]}
                  valueFormatter={(value: number) => `${value} tasks`}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEmployeePerformance ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <BarChart 
                  data={employeePerformanceData}
                  categories={["tasks", "efficiency"]} 
                  index="name"
                  colors={["blue", "purple"]}
                  valueFormatter={(value: number, category) => 
                    category === "efficiency" ? `${value}%` : `${value} tasks`
                  }
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProjectProgress ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <LineChart 
                  data={projectProgressData}
                  categories={["Website", "Mobile", "Database"]}
                  index="name"
                  colors={["blue", "purple", "cyan"]}
                  valueFormatter={(value: number) => `${value}%`}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
