import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus } from "lucide-react";

interface UserHeaderProps {
  isCurrentUserProjectOwner: boolean;
  inviteUserOpen: boolean;
  inviteEmail: string;
  onInviteUserOpenChange: (open: boolean) => void;
  onInviteEmailChange: (email: string) => void;
  onInviteUser: () => void;
}

export function UserHeader({ 
  isCurrentUserProjectOwner, 
  inviteUserOpen, 
  inviteEmail, 
  onInviteUserOpenChange, 
  onInviteEmailChange, 
  onInviteUser 
}: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage project users and their access
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700">
          <Shield className="h-3 w-3 mr-1" />
          {isCurrentUserProjectOwner ? "Owner" : "Member"}
        </Badge>
        {isCurrentUserProjectOwner && (
          <Dialog open={inviteUserOpen} onOpenChange={onInviteUserOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this project. They'll receive an email with setup instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => onInviteEmailChange(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onInviteUserOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={onInviteUser}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!inviteEmail.trim()}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}