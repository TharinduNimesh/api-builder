import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as projectService from '@/services/project';
import { z } from 'zod';
import { notifyError, notifySuccess } from '@/lib/notify';

const SetupProject = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [enableRoles, setEnableRoles] = useState(false);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const [defaultRole, setDefaultRole] = useState<string>("");
  const [roles, setRoles] = useState([
    { name: "admin", description: "Full administrative access to all API endpoints" },
    { name: "user", description: "Limited access to specific API endpoints" }
  ]);

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
  };

  const addRole = () => {
    setRoles([...roles, { name: "", description: "" }]);
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRole = (index: number, field: 'name' | 'description', value: string) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">API Builder</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create your first project</CardTitle>
            <CardDescription>
              Each project gets a dedicated Postgres + PostgREST instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input 
                id="projectName" 
                value={projectName}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                placeholder="My API Project"
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="signupEnabled">Enable app-user signup</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow external application users to self-register
                  </p>
                </div>
                <Switch 
                  id="signupEnabled"
                  checked={signupEnabled}
                  onCheckedChange={setSignupEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enableRoles">Enable role management</Label>
                  <p className="text-sm text-muted-foreground">
                    Control API endpoint access with user roles
                  </p>
                </div>
                <Switch 
                  id="enableRoles"
                  checked={enableRoles}
                  onCheckedChange={setEnableRoles}
                />
              </div>

              {enableRoles && (
                <div className="space-y-4 border border-border rounded-lg p-4 bg-accent/20">
                  <div className="flex items-center justify-between">
                    <Label>Roles</Label>
                    <Button variant="outline" size="sm" onClick={addRole}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add role
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Define roles to control API endpoint access levels
                  </p>
                  
                  <div className="space-y-3">
                    {roles.map((role, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-md bg-background">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Role name"
                            value={role.name}
                            onChange={(e) => updateRole(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Description"
                            value={role.description}
                            onChange={(e) => updateRole(index, 'description', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRole(index)}
                          disabled={roles.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultRole">Default role (optional)</Label>
                    <div className="flex gap-3">
                      <Input
                        id="defaultRole"
                        placeholder="e.g. user"
                        list="roles-list"
                        value={defaultRole}
                        onChange={(e) => setDefaultRole(e.target.value)}
                      />
                      <datalist id="roles-list">
                        {roles.filter(r => r.name).map((r, i) => (
                          <option key={i} value={r.name} />
                        ))}
                      </datalist>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If set, newly signed-up app users will be assigned this role by default.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button className="px-8" onClick={() => {
              // validate and call create project API
              const schema = z.object({
                name: z.string().trim().min(1, 'Project name is required'),
                enable_roles: z.boolean().optional(),
                roles: z.array(z.object({ name: z.string().min(1), description: z.string().optional() })).optional(),
                is_protected: z.boolean().optional(),
                signup_enabled: z.boolean().optional(),
                default_role: z.string().trim().min(1).optional(),
              });
              const parsed = schema.safeParse({ name: projectName, enable_roles: enableRoles, roles, is_protected: false, signup_enabled: signupEnabled, default_role: defaultRole || undefined });
              if (!parsed.success) {
                const first = parsed.error.errors[0];
                notifyError(first?.message || 'Validation error');
                return;
              }
              (async () => {
                try {
                  const res = await projectService.createProject({ name: projectName, enable_roles: enableRoles, roles, is_protected: false, signup_enabled: signupEnabled, default_role: defaultRole || undefined });
                  notifySuccess('Project created');
                  navigate('/dashboard');
                } catch (err: any) {
                  if (err?.details && typeof err.details === 'object') {
                    notifyError(Object.values(err.details).map((d: any) => d.message || d).join(', '));
                  } else {
                    notifyError(err?.message || 'Failed to create project');
                  }
                }
              })();
            }}>
              Create project
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SetupProject;