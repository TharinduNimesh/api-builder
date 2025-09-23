import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Save,
  Plus,
  Edit3,
  X,
  Info,
  Globe,
  Lock,
  Users,
  Eye,
  Key,
  RefreshCw
} from "lucide-react";

const Settings = () => {
  const projectInfo = {
    name: "My API Project",
    slug: "my-api-project",
    description: "A comprehensive API for managing user data and content",
    url: "https://my-api-project.supabase.co/rest/v1/",
    created: "2024-01-15",
    lastBackup: "2024-01-20"
  };

  const roles = [
    {
      name: "admin",
      description: "Full access to all resources and settings",
      permissions: ["read", "write", "delete", "manage"],
      users: 2,
      color: "red"
    },
    {
      name: "developer", 
      description: "Can manage tables, functions, and API endpoints",
      permissions: ["read", "write", "create"],
      users: 5,
      color: "blue"
    },
    {
      name: "viewer",
      description: "Read-only access to data and endpoints", 
      permissions: ["read"],
      users: 12,
      color: "green"
    }
  ];

  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com", 
    avatar: null,
    joinDate: "2024-01-15",
    currentRole: "admin"
  };

  const getRoleColor = (color: string) => {
    const colors = {
      red: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
      blue: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700", 
      green: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPermissionIcon = (permission: string) => {
    const icons = {
      read: <Eye className="h-3 w-3" />,
      write: <Edit3 className="h-3 w-3" />,
      delete: <Trash2 className="h-3 w-3" />,
      create: <Plus className="h-3 w-3" />,
      manage: <SettingsIcon className="h-3 w-3" />
    };
    return icons[permission as keyof typeof icons] || <Info className="h-3 w-3" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your project settings, roles, and account preferences
            </p>
          </div>

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
                    <Input id="projectName" defaultValue={projectInfo.name} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectSlug" className="text-sm">Project Slug</Label>
                    <Input id="projectSlug" defaultValue={projectInfo.slug} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription" className="text-sm">Description</Label>
                    <Textarea 
                      id="projectDescription" 
                      defaultValue={projectInfo.description}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectUrl" className="text-sm">API Base URL</Label>
                    <div className="flex items-center gap-2">
                      <Input id="projectUrl" defaultValue={projectInfo.url} readOnly className="bg-slate-50 dark:bg-slate-800 h-9 text-sm" />
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
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
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{userProfile.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{userProfile.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(roles.find(r => r.name === userProfile.currentRole)?.color || "blue")} variant="outline">
                        {userProfile.currentRole}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                      <Input id="fullName" defaultValue={userProfile.name} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email Address</Label>
                      <Input id="email" type="email" defaultValue={userProfile.email} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Leave blank to keep current" className="h-9" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Roles & Backup */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Role Management */}
            <div className="xl:col-span-2">
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
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roles.map((role, index) => (
                      <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getRoleColor(role.color)} border text-xs`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {role.name}
                            </Badge>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{role.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{role.users} users</span>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 h-7 w-7 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Permissions:</span>
                          {role.permissions.map((permission, pIndex) => (
                            <Badge key={pIndex} variant="outline" className="text-xs h-5">
                              {getPermissionIcon(permission)}
                              <span className="ml-1">{permission}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backup & Restore */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Backup & Restore</CardTitle>
                    <CardDescription className="text-sm">Database backup options</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Card className="p-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Create Backup</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Export database</p>
                      </div>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white h-8">
                        <Download className="h-3 w-3 mr-2" />
                        Backup
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Restore</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Import backup</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full h-8">
                        <Upload className="h-3 w-3 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Last Backup</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {projectInfo.lastBackup}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBackup" className="text-sm">Auto Backup</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Daily backups</p>
                    </div>
                    <Switch id="autoBackup" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backupNotify" className="text-sm">Notifications</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Backup alerts</p>
                    </div>
                    <Switch id="backupNotify" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



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
                <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">Reset Project</h3>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Clear all data and reset to initial state
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">Delete Account</h3>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Permanently delete account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
