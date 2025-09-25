import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";

interface UserEmptyStateProps {
  filterStatus: string;
  isCurrentUserProjectOwner: boolean;
  onInviteUser: () => void;
}

export function UserEmptyState({ filterStatus, isCurrentUserProjectOwner, onInviteUser }: UserEmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No users found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
          {filterStatus === "all" ? "No users in this project yet." : `No ${filterStatus} users found.`}
        </p>
        {isCurrentUserProjectOwner && filterStatus === "all" && (
          <Button 
            onClick={onInviteUser}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite First User
          </Button>
        )}
      </CardContent>
    </Card>
  );
}