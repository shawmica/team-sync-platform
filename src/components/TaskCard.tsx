
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string;
  assignee?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  projectName?: string;
  onClick?: () => void;
}

export function TaskCard({
  title,
  description,
  priority,
  status,
  dueDate,
  assignee,
  projectName,
  onClick,
}: TaskCardProps) {
  const priorityColors = {
    low: "bg-green-100 text-green-800 hover:bg-green-200",
    medium: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    high: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    "in-progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    review: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    done: "bg-green-100 text-green-800 hover:bg-green-200",
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <Badge variant="outline" className={cn(priorityColors[priority])}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </Badge>
          <Badge variant="outline" className={cn(statusColors[status])}>
            {status
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        {projectName && (
          <Badge variant="secondary" className="mb-2">
            {projectName}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Due {dueDate}</span>
        </div>
        {assignee && (
          <div className="flex items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
