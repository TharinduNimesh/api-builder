import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Crown, Mail, Calendar, Ban, CheckCircle } from "lucide-react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  createdAt: string;
  lastLogin: string;
  role: string;
  isProjectOwner: boolean;
}

interface UserCardProps {
  user: User;
  isCurrentUserProjectOwner: boolean;
  onToggleUserStatus: (userId: string, currentStatus: boolean) => void;
}

export function UserCard({ user, isCurrentUserProjectOwner, onToggleUserStatus }: UserCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" 
      ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700"
      : "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-3 w-3" />
      : <Ban className="h-3 w-3" />;
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.first_name} {user.last_name}
                </h3>
                {user.isProjectOwner && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                )}
                <Badge className={`text-xs border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <Badge className={user.is_active 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs mt-1"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs mt-1"
              }>
                {getStatusIcon(user.is_active)}
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {isCurrentUserProjectOwner && !user.isProjectOwner && (
              <div className="flex items-center gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={user.is_active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                    >
                      {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user.is_active ? "Ban User" : "Activate User"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to {user.is_active ? "ban" : "activate"} {user.first_name} {user.last_name}?
                        {user.is_active && " They will lose access to the project immediately."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onToggleUserStatus(user.id, user.is_active)}
                        className={user.is_active 
                          ? "bg-red-600 hover:bg-red-700" 
                          : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        {user.is_active ? "Ban User" : "Activate User"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}