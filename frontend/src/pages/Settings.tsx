import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TopBar } from "@/components/layout/TopBar";
import { RoleManagementModal } from "@/components/settings/RoleManagementModal";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Trash2, 
  AlertTriangle,
  Save,
  Plus,
  Edit3,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import * as settingsService from "@/services/settings";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Project state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [enableRoles, setEnableRoles] = useState(false);
  
  // User profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Role management modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"add" | "edit">("add");
  const [editingRoleIndex, setEditingRoleIndex] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<any>(null);

  // Confirmation dialogs
  const [deleteRoleDialog, setDeleteRoleDialog] = useState({ open: false, index: -1 });
  const [resetProjectDialog, setResetProjectDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.fetchSettings();
      
      // Set owner status
      setIsOwner(data.isOwner);
      
      // Set project data
      if (data.project) {
        setProjectName(data.project.name);
        setProjectDescription(data.project.description || "");
        setRoles(data.project.roles || []);
        setEnableRoles(data.project.enable_roles);
      }
      
      // Set user profile data
      setFirstName(data.user.first_name);
      setLastName(data.user.last_name);
      setEmail(data.user.email);
    } catch (err) {
      console.error("Failed to load settings", err);
      notifyError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      setSaving(true);
      await settingsService.updateProject({
        name: projectName,
        description: projectDescription,
      });
      notifySuccess("Project updated successfully");
      await loadSettings();
    } catch (err) {
      console.error("Failed to update project", err);
      notifyError("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      await settingsService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: newPassword || undefined,
      });
      setNewPassword(""); // Clear password field after update
      notifySuccess("Profile updated successfully");
      await loadSettings();
    } catch (err) {
      console.error("Failed to update profile", err);
      notifyError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoles = async () => {
    try {
      setSaving(true);
      await settingsService.updateRoles({
        roles,
        enable_roles: enableRoles,
      });
      notifySuccess("Roles updated successfully");
      await loadSettings();
    } catch (err) {
      console.error("Failed to update roles", err);
      notifyError("Failed to update roles");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = () => {
    setRoleModalMode("add");
    setEditingRole(null);
    setEditingRoleIndex(null);
    setRoleModalOpen(true);
  };

  const handleEditRole = (role: any, index: number) => {
    setRoleModalMode("edit");
    setEditingRole(role);
    setEditingRoleIndex(index);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = (index: number) => {
    setDeleteRoleDialog({ open: true, index });
  };

  const confirmDeleteRole = () => {
    const updatedRoles = roles.filter((_, i) => i !== deleteRoleDialog.index);
    setRoles(updatedRoles);
    // Auto-save after delete
    saveRoles(updatedRoles);
  };

  const handleSaveRole = (role: any) => {
    let updatedRoles: any[];
    
    if (roleModalMode === "add") {
      // Add new role
      updatedRoles = [...roles, role];
    } else {
      // Edit existing role
      updatedRoles = roles.map((r, i) => (i === editingRoleIndex ? role : r));
    }
    
    setRoles(updatedRoles);
    setRoleModalOpen(false);
    
    // Auto-save roles
    saveRoles(updatedRoles);
  };

  const saveRoles = async (updatedRoles: any[]) => {
    try {
      setSaving(true);
      await settingsService.updateRoles({
        roles: updatedRoles,
        enable_roles: enableRoles,
      });
      notifySuccess("Roles updated successfully");
      await loadSettings();
    } catch (err) {
      console.error("Failed to update roles", err);
      notifyError("Failed to update roles");
    } finally {
      setSaving(false);
    }
  };

  const confirmResetProject = async () => {
    try {
      setSaving(true);
      await settingsService.resetProject();
      notifySuccess("Project reset successfully");
      // Navigate to setup page after reset
      navigate("/setup");
    } catch (err) {
      console.error("Failed to reset project", err);
      notifyError("Failed to reset project");
      setSaving(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (isOwner && confirmDeleteText !== "DELETE") {
      notifyError("Please type DELETE to confirm");
      return;
    }
    
    try {
      setSaving(true);
      const result = await settingsService.deleteAccount();
      
      if (isOwner) {
        notifySuccess("Account and project deleted successfully");
      } else {
        notifySuccess("Account deactivated successfully");
      }
      
      // Navigate to sign in after account deletion/deactivation
      navigate("/signin");
    } catch (err) {
      console.error("Failed to delete/deactivate account", err);
      notifyError("Failed to process account action");
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">
                Manage your project settings, roles, and account preferences
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {/* Top Section - Project & Profile */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Project Information */}
                <Card className="border border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Information</CardTitle>
                        <CardDescription className="text-sm">Basic project settings</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm">Project Name</Label>
                        <Input 
                          id="projectName" 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          disabled={!isOwner}
                          className="h-9" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectDescription" className="text-sm">Description</Label>
                        <Textarea 
                          id="projectDescription" 
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          disabled={!isOwner}
                          className="min-h-[80px] text-sm"
                        />
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={handleUpdateProject}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={loadSettings} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    )}
                    {!isOwner && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        Only the project owner can modify project settings
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card className="border border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile Settings</CardTitle>
                        <CardDescription className="text-sm">Your account information</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{firstName} {lastName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700" variant="outline">
                            {isOwner ? "owner" : "user"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="firstName" className="text-sm">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-9" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-9" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-sm">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-9" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            placeholder="Leave blank to keep current"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-9" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleUpdateProfile}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Update
                      </Button>
                      <Button variant="outline" size="sm" onClick={loadSettings} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Section - Role Management & Danger Zone */}
              <div className="grid grid-cols-1 gap-6">
                {/* Role Management */}
                {isOwner && (
                  <Card className="border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Role Management</CardTitle>
                            <CardDescription className="text-sm">Configure user roles and API access</CardDescription>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={handleAddRole}
                          disabled={saving}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Role
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {roles.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                              No roles defined yet
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleAddRole}
                              disabled={saving}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Role
                            </Button>
                          </div>
                        ) : (
                          roles.map((role: any, index: number) => (
                            <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 border text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      {role.name || "Unnamed Role"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {role.description || "No description"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => handleEditRole(role, index)}
                                    disabled={saving}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDeleteRole(index)}
                                    disabled={saving}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Role Management Modal */}
                <RoleManagementModal
                  open={roleModalOpen}
                  onClose={() => setRoleModalOpen(false)}
                  onSave={handleSaveRole}
                  role={editingRole}
                  mode={roleModalMode}
                />

                {/* Danger Zone */}
                <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-100">Danger Zone</CardTitle>
                        <CardDescription className="text-sm text-red-700 dark:text-red-300">
                          Irreversible and destructive actions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isOwner && (
                        <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">Reset Project</h3>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              Clear all tables, functions, query history, and roles
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                            onClick={() => setResetProjectDialog(true)}
                            disabled={saving}
                          >
                            {saving ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                            Reset
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg">
                        <div>
                          <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">
                            {isOwner ? "Delete Account & Project" : "Deactivate Account"}
                          </h3>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {isOwner 
                              ? "Permanently delete your account, project, and all associated data"
                              : "Deactivate your account (can be reactivated by owner)"
                            }
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteAccountDialog(true)}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Trash2 className="h-3 w-3 mr-2" />}
                          {isOwner ? "Delete" : "Deactivate"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Confirmation Dialogs */}
              <ConfirmDialog
                open={deleteRoleDialog.open}
                onClose={() => setDeleteRoleDialog({ open: false, index: -1 })}
                onConfirm={confirmDeleteRole}
                title="Delete Role"
                description="Are you sure you want to delete this role? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
              />

              <ConfirmDialog
                open={resetProjectDialog}
                onClose={() => setResetProjectDialog(false)}
                onConfirm={confirmResetProject}
                title="Reset Project"
                description="This will delete all tables, functions, query history, SQL snippets, and reset roles. You will be redirected to the setup page. This action cannot be undone. Are you sure you want to continue?"
                confirmText="Reset Project"
                variant="destructive"
              />

              {/* Delete/Deactivate Account Dialog */}
              {deleteAccountDialog && (
                <ConfirmDialog
                  open={deleteAccountDialog}
                  onClose={() => {
                    setDeleteAccountDialog(false);
                    setConfirmDeleteText("");
                  }}
                  onConfirm={confirmDeleteAccount}
                  title={isOwner ? "Delete Account & Project" : "Deactivate Account"}
                  description={
                    isOwner ? (
                      <>
                        <div className="space-y-3">
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-amber-900 dark:text-amber-100">
                                <p className="font-semibold mb-1">Warning: This is a destructive action!</p>
                                <p>As the project owner, deleting your account will:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                  <li>Permanently delete the entire project</li>
                                  <li>Delete all tables, functions, and data</li>
                                  <li>Remove all query history and SQL snippets</li>
                                  <li>Delete all user accounts</li>
                                  <li>Permanently delete your account</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmDelete" className="text-sm font-medium">
                              Type <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">DELETE</span> to confirm:
                            </Label>
                            <Input
                              id="confirmDelete"
                              value={confirmDeleteText}
                              onChange={(e) => setConfirmDeleteText(e.target.value)}
                              placeholder="DELETE"
                              className="font-mono"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      "Your account will be deactivated. You won't be able to access the system until the project owner reactivates your account. This will not affect the project or other users."
                    )
                  }
                  confirmText={isOwner ? "Delete Account & Project" : "Deactivate Account"}
                  confirmDisabled={isOwner && confirmDeleteText !== "DELETE"}
                  variant="destructive"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
