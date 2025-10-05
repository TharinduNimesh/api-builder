import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Role {
  name: string;
  description?: string;
}

interface RoleManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role?: Role | null;
  mode: "add" | "edit";
}

export function RoleManagementModal({
  open,
  onClose,
  onSave,
  role,
  mode,
}: RoleManagementModalProps) {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setRoleDescription(role.description || "");
    } else {
      setRoleName("");
      setRoleDescription("");
    }
  }, [role, open]);

  const handleSave = () => {
    if (!roleName.trim()) {
      alert("Role name is required");
      return;
    }

    onSave({
      name: roleName.trim(),
      description: roleDescription.trim(),
    });

    // Reset form
    setRoleName("");
    setRoleDescription("");
  };

  const handleCancel = () => {
    setRoleName("");
    setRoleDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new role for API access control suggestions"
              : "Modify the role configuration"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              placeholder="e.g., admin, developer, viewer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Describe what this role represents..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {mode === "add" ? "Add Role" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
