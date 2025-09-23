import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SetupProject = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [enableRoles, setEnableRoles] = useState(false);
  const [roles, setRoles] = useState([
    { name: "admin", description: "Full access to all resources" },
    { name: "developer", description: "Can manage tables and functions" },
    { name: "viewer", description: "Read-only access" }
  ]);

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    // Auto-generate slug
    const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    setProjectSlug(slug);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="projectSlug">Project slug</Label>
                <Input 
                  id="projectSlug" 
                  value={projectSlug}
                  onChange={(e) => setProjectSlug(e.target.value)}
                  placeholder="my-api-project"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Used in your API URL: https://{projectSlug || 'project-slug'}.api.com
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enableRoles">Enable role management</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable role management (Row-Level Security later)
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
                    Add role names (e.g. admin, developer, viewer)
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
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button className="px-8" onClick={() => {
              // demo: pretend to create project then navigate to dashboard
              // in a real flow we'd call an API and wait for success
              navigate('/dashboard');
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