
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

const taskCompletionData = [
  { name: 'Week 1', completed: 12, pending: 5 },
  { name: 'Week 2', completed: 19, pending: 7 },
  { name: 'Week 3', completed: 15, pending: 9 },
  { name: 'Week 4', completed: 23, pending: 4 },
];

const employeePerformanceData = [
  { name: 'Emily D.', tasks: 18, efficiency: 92 },
  { name: 'Daniel W.', tasks: 14, efficiency: 88 },
  { name: 'Sophia M.', tasks: 24, efficiency: 95 },
  { name: 'James T.', tasks: 16, efficiency: 86 },
  { name: 'Alex C.', tasks: 21, efficiency: 91 },
];

const projectProgressData = [
  { name: 'Jan', Website: 45, Mobile: 30, Database: 15 },
  { name: 'Feb', Website: 50, Mobile: 35, Database: 25 },
  { name: 'Mar', Website: 55, Mobile: 38, Database: 35 },
  { name: 'Apr', Website: 65, Mobile: 40, Database: 45 },
  { name: 'May', Website: 70, Mobile: 45, Database: 55 },
];

export default function Reports() {
  const [timeFrame, setTimeFrame] = useState("month");
  
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
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">2 completed this month</p>
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
                <BarChart 
                  data={taskCompletionData} 
                  categories={["completed", "pending"]}
                  index="name"
                  colors={["green", "orange"]}
                  valueFormatter={(value: number) => `${value} tasks`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={projectProgressData}
                  categories={["Website", "Mobile", "Database"]}
                  index="name"
                  colors={["blue", "purple", "cyan"]}
                  valueFormatter={(value: number) => `${value}%`}
                  className="h-[300px]"
                />
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
              <BarChart 
                data={taskCompletionData} 
                categories={["completed", "pending"]}
                index="name"
                colors={["green", "orange"]}
                valueFormatter={(value: number) => `${value} tasks`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={projectProgressData}
                categories={["Website", "Mobile", "Database"]}
                index="name"
                colors={["blue", "purple", "cyan"]}
                valueFormatter={(value: number) => `${value}%`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
