
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EmployeeCardProps {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar?: string;
  taskCount: number;
  skills?: string[];
  availability?: "available" | "busy" | "offline";
}

export function EmployeeCard({
  name,
  position,
  department,
  email,
  avatar,
  taskCount,
  skills,
  availability,
}: EmployeeCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const availabilityColors = {
    available: "bg-green-100 text-green-800",
    busy: "bg-amber-100 text-amber-800",
    offline: "bg-gray-100 text-gray-800",
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{name}</h3>
              {availability && (
                <Badge
                  variant="outline"
                  className={`${availabilityColors[availability]}`}
                >
                  {availability.charAt(0).toUpperCase() + availability.slice(1)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{position}</p>
            <p className="text-sm text-muted-foreground">{department}</p>
            <p className="text-sm text-primary">{email}</p>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{taskCount}</span>
                <span className="text-muted-foreground"> active tasks</span>
              </div>
            </div>

            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
