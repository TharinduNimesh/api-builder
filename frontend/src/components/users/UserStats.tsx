import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, Globe } from "lucide-react";

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

interface UserStatsProps {
  users: User[];
  appUsersCount: number;
}

export function UserStats({ users, appUsersCount }: UserStatsProps) {
  const activeUsers = users.filter(u => u.is_active);
  const inactiveUsers = users.filter(u => !u.is_active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{users.length}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeUsers.length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Inactive Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{inactiveUsers.length}</p>
            </div>
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <UserX className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">App Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{appUsersCount}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}