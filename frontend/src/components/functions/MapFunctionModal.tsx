import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, Info, Code2, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FunctionData } from '@/services/functions';
import * as endpointService from '@/services/endpoints';
import { getProject } from '@/services/project';

interface MapFunctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  functionData: FunctionData | null;
  onSuccess?: () => void;
}

interface ParsedParam {
  name: string;
  type: string;
}

export function MapFunctionModal({
  open,
  onOpenChange,
  functionData,
  onSuccess,
}: MapFunctionModalProps) {
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [sql, setSql] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [projectRoleNames, setProjectRoleNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Parse function parameters from "param1 type1, param2 type2" format
  const parsedParams = useMemo((): ParsedParam[] => {
    if (!functionData?.parameters) return [];
    
    try {
      // Split by comma but avoid commas inside parens
      const paramStrings = functionData.parameters.split(/,(?![^()]*\))/).map(p => p.trim());
      
      return paramStrings.map(paramStr => {
        // Split by whitespace to separate name and type
        const parts = paramStr.split(/\s+/);
        const name = parts[0] || '';
        const type = parts.slice(1).join(' ') || 'text';
        
        return { name, type };
      }).filter(p => p.name); // Filter out empty names
    } catch {
      return [];
    }
  }, [functionData]);

  // Detect path parameters dynamically from the current path
  const pathParams = useMemo(() => {
    const params: string[] = [];
    const pathRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = pathRe.exec(path)) !== null) {
      if (!params.includes(m[1])) params.push(m[1]);
    }
    return params;
  }, [path]);

  // Load project roles on mount
  useEffect(() => {
    const loadProjectRoles = async () => {
      try {
        const project = await getProject();
        if (project.enable_roles && project.roles) {
          const roles = Array.isArray(project.roles) ? project.roles : [];
          setProjectRoleNames(roles.map((r: any) => r.name || r));
        } else {
          setProjectRoleNames(['admin', 'user', 'guest']);
        }
      } catch (error) {
        console.error("Failed to load project roles:", error);
        setProjectRoleNames(['admin', 'user', 'guest']);
      }
    };

    if (open) {
      loadProjectRoles();
    }
  }, [open]);

  // Auto-generate suggestions when modal opens or function changes
  useEffect(() => {
    if (open && functionData) {
      // Suggest endpoint path based on function name
      const suggestedPath = `/functions/${functionData.name}`;
      setPath(suggestedPath);

      // Suggest description
      const paramCount = parsedParams.length;
      const paramText = paramCount > 0 ? ` with ${paramCount} parameter${paramCount > 1 ? 's' : ''}` : '';
      setDescription(`Execute ${functionData.name} function${paramText}`);

      // Generate SQL query to call the function
      const schema = functionData.schema || 'public';
      const fullName = `${schema}.${functionData.name}`;
      
      if (parsedParams.length > 0) {
        // Create placeholders for parameters
        const placeholders = parsedParams.map(p => `{${p.name}}`).join(', ');
        setSql(`SELECT * FROM ${fullName}(${placeholders})`);
      } else {
        setSql(`SELECT * FROM ${fullName}()`);
      }

      // Suggest GET for functions with no side effects, POST for others
      // You can adjust this logic based on your conventions
      const isMutation = functionData.name.toLowerCase().match(/(insert|update|delete|create|remove|add)/);
      setMethod(isMutation ? 'POST' : 'GET');

      // Reset protection settings
      setIsProtected(false);
      setAllowedRoles([]);
    }
  }, [open, functionData, parsedParams]);

  const handleClose = () => {
    setPath('');
    setDescription('');
    setSql('');
    setIsProtected(false);
    setAllowedRoles([]);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!path.trim() || !path.startsWith('/')) {
      toast.error('Please enter a valid path starting with /');
      return;
    }

    if (!sql.trim()) {
      toast.error('SQL query cannot be empty');
      return;
    }

    try {
      setLoading(true);

      // Detect which parameters are in the path vs query/body
      // If a parameter is in the path (using {paramName}), it should be marked as 'path'
      const params = parsedParams.map(p => {
        const isInPath = pathParams.includes(p.name);
        return {
          name: p.name,
          in: isInPath ? 'path' : (method === 'GET' ? 'query' : 'body') as 'path' | 'query' | 'body',
          type: mapPostgresTypeToParamType(p.type) as 'string' | 'number' | 'boolean',
          required: true,
        };
      });

      // Create the endpoint payload
      const payload = {
        method,
        path,
        description: description.trim() || null,
        sql,
        is_active: true,
        params: params.length > 0 ? params : undefined,
        is_protected: isProtected,
        allowed_roles: isProtected ? (allowedRoles.length > 0 ? allowedRoles : undefined) : undefined,
      };

      await endpointService.createEndpoint(payload);
      toast.success(`Function mapped to ${path} successfully`);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to map function to endpoint');
    } finally {
      setLoading(false);
    }
  };

  // Helper to map PostgreSQL types to parameter types
  const mapPostgresTypeToParamType = (pgType: string): string => {
    const lower = pgType.toLowerCase();
    if (lower.includes('int') || lower.includes('serial') || lower.includes('bigint')) return 'integer';
    if (lower.includes('numeric') || lower.includes('decimal') || lower.includes('real') || lower.includes('double')) return 'number';
    if (lower.includes('bool')) return 'boolean';
    if (lower.includes('json')) return 'object';
    if (lower.includes('array') || lower.includes('[]')) return 'array';
    return 'string';
  };

  const toggleRole = (role: string) => {
    setAllowedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Map Function to API Endpoint</span>
          </DialogTitle>
          <DialogDescription>
            Create a REST API endpoint that executes "{functionData?.name}" function
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Editable Notice */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                Quick setup to get started. You can always edit and fine-tune this endpoint later in <strong>API Designer</strong>.
              </AlertDescription>
            </Alert>

            {/* Function Info Banner */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Function:</span>
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{functionData?.schema || 'public'}.{functionData?.name}</code>
                  </div>
                  {functionData?.parameters && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold flex-shrink-0">Parameters:</span>
                      <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs flex-1">{functionData.parameters}</code>
                    </div>
                  )}
                  {functionData?.return_type && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Returns:</span>
                      <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{functionData.return_type}</code>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Method Selection */}
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as 'GET' | 'POST')}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET - Read data</SelectItem>
                  <SelectItem value="POST">POST - Modify data</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Use GET for queries, POST for data modifications
              </p>
            </div>

            {/* Endpoint Path */}
            <div className="space-y-2">
              <Label htmlFor="path">
                Endpoint Path <span className="text-red-500">*</span>
              </Label>
              <Input
                id="path"
                placeholder="/functions/my-function or /users/{user_id}/orders"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The REST endpoint path (must start with /). Use {'{paramName}'} for path parameters (e.g., {'/users/{id}'})
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of what this endpoint does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* SQL Query */}
            <div className="space-y-2">
              <Label htmlFor="sql">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span>SQL Query <span className="text-red-500">*</span></span>
                </div>
              </Label>
              <Textarea
                id="sql"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="font-mono text-sm min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                The SQL query that calls the function. Use {'{paramName}'} placeholders for parameters.
              </p>
            </div>

            {/* Parameters Preview */}
            {parsedParams.length > 0 && (
              <div className="space-y-2">
                <Label>Detected Parameters</Label>
                <div className="bg-muted/50 border border-border rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {parsedParams.map((param, idx) => {
                      const isInPath = pathParams.includes(param.name);
                      const location = isInPath ? 'path' : (method === 'GET' ? 'query' : 'body');
                      return (
                        <Badge 
                          key={idx} 
                          variant={isInPath ? 'default' : 'secondary'} 
                          className="font-mono text-xs"
                        >
                          {param.name}: {param.type}
                          <span className="ml-1.5 opacity-70">({location})</span>
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pathParams.length > 0 
                      ? `Parameters in path placeholders will be used as path parameters, others as ${method === 'GET' ? 'query' : 'body'} parameters`
                      : `These will be exposed as ${method === 'GET' ? 'query' : 'body'} parameters in the API`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Access Control */}
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-semibold">Access Control</Label>
              </div>

              {/* Protected Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="protected" className="font-medium cursor-pointer">
                    Require Authentication
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Only authenticated users can access this endpoint
                  </p>
                </div>
                <Switch
                  id="protected"
                  checked={isProtected}
                  onCheckedChange={setIsProtected}
                />
              </div>

              {/* Role Selection */}
              {isProtected && (
                <div className="space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                  <Label>Allowed Roles (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Leave empty to allow all authenticated users, or select specific roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectRoleNames.map((role) => (
                      <Badge
                        key={role}
                        variant={allowedRoles.includes(role) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleRole(role)}
                      >
                        {allowedRoles.includes(role) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Map to Endpoint
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
