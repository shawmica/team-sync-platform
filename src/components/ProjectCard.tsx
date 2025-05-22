
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "planning" | "active" | "on-hold" | "completed";
  dueDate: string;
  teamMembers: Array<{
    name: string;
    avatar?: string;
    initials: string;
  }>;
  taskStats: {
    total: number;
    completed: number;
  };
}

export function ProjectCard({
  name,
  description,
  progress,
  status,
  dueDate,
  teamMembers,
  taskStats,
}: ProjectCardProps) {
  const statusColors = {
    planning: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    "on-hold": "bg-amber-100 text-amber-800",
    completed: "bg-purple-100 text-purple-800",
  };

  const maxDisplayTeamMembers = 3;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <Badge
            variant="outline"
            className={statusColors[status]}
          >
            {status
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Due {dueDate}</span>
          </div>
          <span>
            {taskStats.completed} / {taskStats.total} tasks completed
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
        <div className="flex -space-x-2">
          {teamMembers.slice(0, maxDisplayTeamMembers).map((member, index) => (
            <Avatar key={index} className="h-7 w-7 border-2 border-background">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {teamMembers.length > maxDisplayTeamMembers && (
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted border-2 border-background">
              <span className="text-xs font-medium">
                +{teamMembers.length - maxDisplayTeamMembers}
              </span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
