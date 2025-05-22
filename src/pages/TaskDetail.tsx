
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckSquare, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const taskData = {
  "1": {
    id: "1",
    title: "Update user authentication system",
    description: "Implement new security measures in the login system including two-factor authentication and passwordless login options. Review and update the current password policies.",
    priority: "high" as const,
    status: "in-progress" as const,
    dueDate: "2025-05-28",
    assignee: {
      id: "user1",
      name: "Sarah Johnson",
      initials: "SJ",
    },
    projectName: "System Security",
    comments: [
      {
        id: "comment1",
        author: "Michael Roberts",
        authorInitials: "MR",
        content: "Have you considered using JWT tokens for this implementation?",
        createdAt: "2025-05-20T14:30:00",
      },
      {
        id: "comment2",
        author: "Sarah Johnson",
        authorInitials: "SJ",
        content: "Yes, already looking into that approach. Will update once I have a prototype.",
        createdAt: "2025-05-20T15:45:00",
      }
    ],
    attachments: [
      {
        id: "attach1",
        name: "security_requirements.pdf",
        size: "1.2 MB",
        uploadedAt: "2025-05-19T10:15:00",
      }
    ]
  },
  "2": {
    id: "2",
    title: "Create new dashboard wireframes",
    description: "Design mockups for the analytics dashboard with a focus on data visualization and user experience.",
    priority: "medium" as const,
    status: "todo" as const,
    dueDate: "2025-05-30",
    assignee: {
      id: "user2",
      name: "Alex Chen",
      initials: "AC",
    },
    projectName: "Dashboard Redesign",
    comments: [],
    attachments: []
  }
};

interface TaskDetailProps {
  isNew?: boolean;
}

export default function TaskDetail({ isNew = false }: TaskDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  
  // For new task or editing existing task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskStatus, setTaskStatus] = useState<"todo" | "in-progress" | "review" | "completed">("todo");
  const [taskDueDate, setTaskDueDate] = useState("");
  
  useEffect(() => {
    if (!isNew && id && taskData[id]) {
      const task = taskData[id];
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskPriority(task.priority);
      setTaskStatus(task.status);
      setTaskDueDate(task.dueDate);
    }
  }, [id, isNew]);
  
  const handleSave = () => {
    // In a real app, this would save to the database
    console.log("Saving task:", {
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate,
    });
    
    navigate("/tasks");
  };

  const renderPriorityBadge = (priority: "low" | "medium" | "high") => {
    const classes = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={classes[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const renderStatusBadge = (status: "todo" | "in-progress" | "review" | "completed") => {
    const classes = {
      todo: "bg-gray-100 text-gray-800",
      "in-progress": "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    
    const labels = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "In Review",
      completed: "Completed",
    };
    
    return (
      <Badge className={classes[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        <h1 className="text-3xl font-bold">{isNew ? "Create New Task" : "Task Details"}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    value={taskTitle} 
                    onChange={(e) => setTaskTitle(e.target.value)} 
                    placeholder="Enter task title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={taskDescription} 
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter task description" 
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={taskPriority} 
                      onValueChange={(value) => setTaskPriority(value as "low" | "medium" | "high")}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={taskStatus} 
                      onValueChange={(value) => setTaskStatus(value as "todo" | "in-progress" | "review" | "completed")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="dueDate" 
                        type="date" 
                        className="pl-10" 
                        value={taskDueDate} 
                        onChange={(e) => setTaskDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => navigate("/tasks")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {isNew ? "Create Task" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!isNew && id && taskData[id]?.comments && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <div className="space-y-4">
                  {taskData[id].comments.map((comment) => (
                    <div key={comment.id} className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{comment.authorInitials}</span>
                        </div>
                        <div>
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Textarea 
                      placeholder="Add a comment..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" disabled={!newComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {!isNew && id && taskData[id] && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Task Info</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priority:</span>
                      <span>{renderPriorityBadge(taskData[id].priority)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span>{renderStatusBadge(taskData[id].status)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(taskData[id].dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <span className="font-medium">{taskData[id].projectName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Assigned To</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium">{taskData[id].assignee.initials}</span>
                    </div>
                    <div>
                      <p className="font-medium">{taskData[id].assignee.name}</p>
                      <Button variant="link" className="h-auto p-0 text-sm">Change</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {taskData[id].attachments.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                    <div className="space-y-2">
                      {taskData[id].attachments.map(attachment => (
                        <div 
                          key={attachment.id} 
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                              <span className="text-xs">PDF</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
