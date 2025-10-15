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
import { MapPin, AlertCircle, Info, Code2, Shield, CheckCircle2, Loader2, Settings } from "lucide-react";
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Map Function to API Endpoint</span>
          </DialogTitle>
          <DialogDescription>
            Create a REST API endpoint that executes <strong>"{functionData?.name}"</strong> function
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Editable Notice */}
            <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                Quick setup to get started. You can always edit and fine-tune this endpoint later in <strong>API Designer</strong>.
              </AlertDescription>
            </Alert>

            {/* Function Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-base">Function Details</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-muted-foreground min-w-[80px]">Function:</span>
                  <code className="font-mono bg-white dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-orange-600 dark:text-orange-400">
                    {functionData?.schema || 'public'}.{functionData?.name}
                  </code>
                </div>
                {functionData?.parameters && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-muted-foreground min-w-[80px] flex-shrink-0">Parameters:</span>
                    <code className="font-mono bg-white dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs flex-1">
                      {functionData.parameters}
                    </code>
                  </div>
                )}
                {functionData?.return_type && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-muted-foreground min-w-[80px]">Returns:</span>
                    <code className="font-mono bg-white dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
                      {functionData.return_type}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Endpoint Configuration Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-base">Endpoint Configuration</h3>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <Label htmlFor="method" className="text-sm font-medium flex items-center gap-2">
                  HTTP Method
                </Label>
                <Select value={method} onValueChange={(v) => setMethod(v as 'GET' | 'POST')}>
                  <SelectTrigger id="method" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                        <span>Read data</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="POST">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">POST</Badge>
                        <span>Modify data</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Use GET for queries, POST for data modifications
                </p>
              </div>

              {/* Endpoint Path */}
              <div className="space-y-2">
                <Label htmlFor="path" className="text-sm font-medium">
                  Endpoint Path <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="path"
                  placeholder="/functions/my-function or /users/{user_id}/orders"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  required
                  className="h-11 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  The REST endpoint path (must start with /). Use {'{paramName}'} for path parameters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what this endpoint does"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* SQL Query Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-base">SQL Query</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sql" className="text-sm font-medium">
                  SQL Query <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="sql"
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  className="font-mono text-sm min-h-[140px] bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The SQL query that calls the function. Use {'{paramName}'} placeholders for parameters.
                </p>
              </div>
            </div>

            {/* Parameters Preview */}
            {parsedParams.length > 0 && (
              <div className="space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-base">Detected Parameters</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedParams.map((param, idx) => {
                    const isInPath = pathParams.includes(param.name);
                    const location = isInPath ? 'path' : (method === 'GET' ? 'query' : 'body');
                    return (
                      <Badge 
                        key={idx} 
                        variant={isInPath ? 'default' : 'secondary'} 
                        className={`font-mono text-xs ${
                          isInPath 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {param.name}: {param.type}
                        <span className="ml-1.5 opacity-70">({location})</span>
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pathParams.length > 0 
                    ? `Parameters in path placeholders will be used as path parameters, others as ${method === 'GET' ? 'query' : 'body'} parameters`
                    : `These will be exposed as ${method === 'GET' ? 'query' : 'body'} parameters in the API`
                  }
                </p>
              </div>
            )}

            {/* Access Control */}
            <div className="space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-base">Access Control</h3>
              </div>

              {/* Protected Toggle */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <div className="flex-1">
                  <Label htmlFor="protected" className="font-medium cursor-pointer flex items-center gap-2">
                    Require Authentication
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
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
                <div className="space-y-3 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Label className="text-sm font-medium">Allowed Roles (Optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow all authenticated users, or select specific roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectRoleNames.map((role) => (
                      <Badge
                        key={role}
                        variant={allowedRoles.includes(role) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          allowedRoles.includes(role)
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        }`}
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

          {/* Enhanced Footer */}
          <DialogFooter className="border-t pt-4 flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Endpoint...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
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
