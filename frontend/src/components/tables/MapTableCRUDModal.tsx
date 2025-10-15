import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, AlertCircle, Lock, Users, Info, Database, Edit, Trash2, Eye, Plus, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createEndpoint, type CreateEndpointInput } from '@/services/endpoints';
import { getProject } from '@/services/project';
import { getTableColumns } from '@/services/tables';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface CRUDOperation {
  id: 'create' | 'read' | 'readOne' | 'update' | 'delete';
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  sql: string;
  params: Array<{ name: string; in: 'path' | 'query' | 'body'; type?: 'string' | 'number' | 'boolean'; required?: boolean }>;
  enabled: boolean;
  isProtected: boolean;
  allowedRoles: string[];
}

interface MapTableCRUDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: {
    name: string;
    schema?: string;
    columns?: Column[];
  } | null;
  onSuccess?: () => void;
}

export function MapTableCRUDModal({ open, onOpenChange, table, onSuccess }: MapTableCRUDModalProps) {
  const [operations, setOperations] = useState<CRUDOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectRoleNames, setProjectRoleNames] = useState<string[]>([]);
  const [basePath, setBasePath] = useState('');
  const [creatingStatus, setCreatingStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [activeTab, setActiveTab] = useState<string>('create');

  // Fetch table columns when modal opens
  useEffect(() => {
    if (!table || !open) return;

    const fetchColumns = async () => {
      try {
        setFetchingColumns(true);
        const schemaName = table.schema || 'public';
        const columns = await getTableColumns(schemaName, table.name);
        setTableColumns(columns);
      } catch (error) {
        console.error('Failed to fetch table columns:', error);
        toast({
          title: 'Error loading columns',
          description: 'Failed to fetch table column information.',
          variant: 'destructive'
        });
      } finally {
        setFetchingColumns(false);
      }
    };

    fetchColumns();
  }, [table, open]);

  // Generate CRUD operations based on table schema
  useEffect(() => {
    if (!table || !open || tableColumns.length === 0) return;

    const tableName = table.name;
    const schemaName = table.schema || 'public';
    const columns = tableColumns;
    
    // Find primary key column (common patterns)
    const pkColumn = columns.find(c => 
      c.column_name === 'id' || 
      c.column_name === `${tableName}_id` ||
      c.column_name?.toLowerCase().includes('_id')
    ) || columns[0];

    const pkName = pkColumn?.column_name || 'id';
    
    // Filter columns for insert/update (exclude auto-generated columns)
    const insertableColumns = columns.filter(c => 
      c.column_default === null || 
      (!c.column_default?.includes('nextval') && !c.column_default?.includes('CURRENT_TIMESTAMP'))
    );

    const updateableColumns = columns.filter(c => 
      c.column_name !== pkName &&
      (c.column_default === null || 
       (!c.column_default?.includes('nextval') && !c.column_default?.includes('CURRENT_TIMESTAMP')))
    );

    // Helper to map PostgreSQL types to API types
    const mapColumnType = (dataType: string): 'string' | 'number' | 'boolean' => {
      const type = dataType.toLowerCase();
      if (type.includes('int') || type.includes('serial') || type.includes('numeric') || type.includes('decimal') || type.includes('float') || type.includes('double')) return 'number';
      if (type.includes('bool')) return 'boolean';
      // Default to string for json, array, text, etc.
      return 'string';
    };

    const defaultBasePath = `/api/${tableName.toLowerCase()}`;
    setBasePath(defaultBasePath);

    const crudOps: CRUDOperation[] = [
      // CREATE
      {
        id: 'create',
        label: 'Create',
        method: 'POST',
        path: defaultBasePath,
        description: `Create a new ${tableName} record`,
        sql: `INSERT INTO ${schemaName}.${tableName} (${insertableColumns.map(c => c.column_name).join(', ')})
VALUES (${insertableColumns.map(c => `{${c.column_name}}`).join(', ')})
RETURNING *;`,
        params: insertableColumns.map(c => ({
          name: c.column_name,
          in: 'body' as const,
          type: mapColumnType(c.data_type),
          required: c.is_nullable === 'NO'
        })),
        enabled: true,
        isProtected: true,
        allowedRoles: []
      },
      // READ ALL
      {
        id: 'read',
        label: 'Read All',
        method: 'GET',
        path: defaultBasePath,
        description: `Get all ${tableName} records with optional pagination`,
        sql: `SELECT * FROM ${schemaName}.${tableName}
ORDER BY ${pkName} DESC
LIMIT COALESCE({limit}, 50)
OFFSET COALESCE({offset}, 0);`,
        params: [
          { name: 'limit', in: 'query' as const, type: 'number', required: false },
          { name: 'offset', in: 'query' as const, type: 'number', required: false }
        ],
        enabled: true,
        isProtected: false,
        allowedRoles: []
      },
      // READ ONE
      {
        id: 'readOne',
        label: 'Read One',
        method: 'GET',
        path: `${defaultBasePath}/{${pkName}}`,
        description: `Get a single ${tableName} record by ${pkName}`,
        sql: `SELECT * FROM ${schemaName}.${tableName}
WHERE ${pkName} = {${pkName}}
LIMIT 1;`,
        params: [
          { name: pkName, in: 'path' as const, type: mapColumnType(pkColumn?.data_type || 'integer'), required: true }
        ],
        enabled: true,
        isProtected: false,
        allowedRoles: []
      },
      // UPDATE
      {
        id: 'update',
        label: 'Update',
        method: 'PUT',
        path: `${defaultBasePath}/{${pkName}}`,
        description: `Update a ${tableName} record by ${pkName}`,
        sql: `UPDATE ${schemaName}.${tableName}
SET ${updateableColumns.map(c => `${c.column_name} = {${c.column_name}}`).join(',\n    ')}
WHERE ${pkName} = {${pkName}}
RETURNING *;`,
        params: [
          { name: pkName, in: 'path' as const, type: mapColumnType(pkColumn?.data_type || 'integer'), required: true },
          ...updateableColumns.map(c => ({
            name: c.column_name,
            in: 'body' as const,
            type: mapColumnType(c.data_type),
            required: c.is_nullable === 'NO'
          }))
        ],
        enabled: true,
        isProtected: true,
        allowedRoles: []
      },
      // DELETE
      {
        id: 'delete',
        label: 'Delete',
        method: 'DELETE',
        path: `${defaultBasePath}/{${pkName}}`,
        description: `Delete a ${tableName} record by ${pkName}`,
        sql: `DELETE FROM ${schemaName}.${tableName}
WHERE ${pkName} = {${pkName}}
RETURNING *;`,
        params: [
          { name: pkName, in: 'path' as const, type: mapColumnType(pkColumn?.data_type || 'integer'), required: true }
        ],
        enabled: true,
        isProtected: true,
        allowedRoles: []
      }
    ];

    setOperations(crudOps);
  }, [table, open, tableColumns]);

  // Load project roles
  useEffect(() => {
    if (!open) return;

    const loadRoles = async () => {
      try {
        const project = await getProject();
        if (project.enable_roles && project.roles) {
          const roles = Array.isArray(project.roles) ? project.roles : [];
          setProjectRoleNames(roles.map((r: any) => r.name || r));
        } else {
          // Fallback to default roles if not configured
          setProjectRoleNames([]);
        }
      } catch (error) {
        console.error('Failed to load project roles:', error);
        setProjectRoleNames([]);
      }
    };

    loadRoles();
  }, [open]);

  // Update paths when base path changes
  const handleBasePathChange = (newBasePath: string) => {
    setBasePath(newBasePath);
    setOperations(ops => ops.map(op => {
      if (op.id === 'create' || op.id === 'read') {
        return { ...op, path: newBasePath };
      } else {
        const pathParam = op.params.find(p => p.in === 'path');
        if (pathParam) {
          return { ...op, path: `${newBasePath}/{${pathParam.name}}` };
        }
      }
      return op;
    }));
  };

  const toggleOperation = (opId: string) => {
    setOperations(ops => ops.map(op => 
      op.id === opId ? { ...op, enabled: !op.enabled } : op
    ));
  };

  const toggleProtection = (opId: string) => {
    setOperations(ops => ops.map(op => 
      op.id === opId ? { ...op, isProtected: !op.isProtected } : op
    ));
  };

  const toggleRole = (opId: string, role: string) => {
    setOperations(ops => ops.map(op => {
      if (op.id !== opId) return op;
      
      const hasRole = op.allowedRoles.includes(role);
      return {
        ...op,
        allowedRoles: hasRole
          ? op.allowedRoles.filter(r => r !== role)
          : [...op.allowedRoles, role]
      };
    }));
  };

  const updateOperation = (opId: string, updates: Partial<CRUDOperation>) => {
    setOperations(ops => ops.map(op => 
      op.id === opId ? { ...op, ...updates } : op
    ));
  };

  const handleCreateEndpoints = async () => {
    const enabledOps = operations.filter(op => op.enabled);
    
    if (enabledOps.length === 0) {
      toast({
        title: 'No operations selected',
        description: 'Please select at least one CRUD operation to create.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const statusMap: Record<string, 'pending' | 'success' | 'error'> = {};
    
    try {
      // Create endpoints sequentially to show progress
      for (const op of enabledOps) {
        statusMap[op.id] = 'pending';
        setCreatingStatus({ ...statusMap });

        try {
          const payload: CreateEndpointInput = {
            method: op.method,
            path: op.path,
            description: op.description,
            sql: op.sql,
            params: op.params,
            is_protected: op.isProtected,
            allowed_roles: op.isProtected && op.allowedRoles.length > 0 ? op.allowedRoles : undefined,
            is_active: true
          };

          await createEndpoint(payload);
          statusMap[op.id] = 'success';
        } catch (error: any) {
          console.error(`Failed to create ${op.label} endpoint:`, error);
          statusMap[op.id] = 'error';
        }

        setCreatingStatus({ ...statusMap });
      }

      const successCount = Object.values(statusMap).filter(s => s === 'success').length;
      const errorCount = Object.values(statusMap).filter(s => s === 'error').length;

      if (errorCount === 0) {
        toast({
          title: 'CRUD endpoints created',
          description: `Successfully created ${successCount} API endpoint${successCount > 1 ? 's' : ''}.`
        });
        
        onSuccess?.();
        onOpenChange(false);
      } else if (successCount > 0) {
        toast({
          title: 'Partially completed',
          description: `Created ${successCount} endpoint${successCount > 1 ? 's' : ''}, ${errorCount} failed.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Failed to create endpoints',
          description: 'All endpoint creation requests failed.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => setCreatingStatus({}), 2000);
    }
  };

  const enabledCount = operations.filter(op => op.enabled).length;

  // Helper to get icon and color for each operation
  const getOperationIcon = (opId: string) => {
    switch (opId) {
      case 'create': return { icon: Plus, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'read': return { icon: Database, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'readOne': return { icon: Eye, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' };
      case 'update': return { icon: Edit, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'delete': return { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      default: return { icon: Database, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/30' };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Map Table to CRUD APIs</span>
          </DialogTitle>
          <DialogDescription>
            Generate REST API endpoints for <strong>{table?.name}</strong>. Configure each operation with tabs below.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {fetchingColumns && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading table schema...</span>
          </div>
        )}

        {/* Main Content with Tabs */}
        {!fetchingColumns && operations.length > 0 && (
          <>
            {/* Base Path Configuration */}
            <div className="px-6 pt-4 flex-shrink-0">
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePath" className="text-sm font-semibold">Base API Path</Label>
                    <Input
                      id="basePath"
                      value={basePath}
                      onChange={(e) => handleBasePathChange(e.target.value)}
                      placeholder="/api/tablename"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      All CRUD operations will use this as the base path
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for each CRUD operation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <div className="px-6 flex-shrink-0">
                <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800">
                  {operations.map((op) => {
                    const { icon: Icon, color, bg } = getOperationIcon(op.id);
                    return (
                      <TabsTrigger
                        key={op.id}
                        value={op.id}
                        className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                          </div>
                          <span className="hidden sm:inline">{op.label}</span>
                          {!op.enabled && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab Content for each operation */}
              <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
                {operations.map((op) => {
                  const { icon: Icon, color, bg } = getOperationIcon(op.id);
                  
                  return (
                    <TabsContent key={op.id} value={op.id} className="mt-0 space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                      {/* Operation Header */}
                      <div className={`border-2 rounded-lg p-4 ${
                        op.enabled 
                          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' 
                          : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg} flex-shrink-0`}>
                              <Icon className={`h-6 w-6 ${color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{op.label}</h3>
                                <Badge variant={
                                  op.method === 'GET' ? 'default' : 
                                  op.method === 'POST' ? 'secondary' : 
                                  op.method === 'PUT' ? 'outline' : 
                                  'destructive'
                                }>
                                  {op.method}
                                </Badge>
                                {creatingStatus[op.id] === 'pending' && (
                                  <Badge variant="outline" className="gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Creating...
                                  </Badge>
                                )}
                                {creatingStatus[op.id] === 'success' && (
                                  <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Created
                                  </Badge>
                                )}
                                {creatingStatus[op.id] === 'error' && (
                                  <Badge variant="outline" className="gap-1 border-red-500 text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    Failed
                                  </Badge>
                                )}
                              </div>
                              <code className="text-sm text-muted-foreground font-mono">{op.path}</code>
                              <p className="text-sm text-muted-foreground mt-2">{op.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Label htmlFor={`${op.id}-enabled`} className="text-sm cursor-pointer">
                              {op.enabled ? 'Enabled' : 'Disabled'}
                            </Label>
                            <Switch
                              id={`${op.id}-enabled`}
                              checked={op.enabled}
                              onCheckedChange={() => toggleOperation(op.id)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Only show details if enabled */}
                      {op.enabled && (
                        <div className="space-y-4">
                          {/* Description */}
                          <div className="space-y-2">
                            <Label htmlFor={`${op.id}-desc`}>Description</Label>
                            <Input
                              id={`${op.id}-desc`}
                              value={op.description}
                              onChange={(e) => updateOperation(op.id, { description: e.target.value })}
                              placeholder="Endpoint description"
                            />
                          </div>

                          {/* Parameters */}
                          {op.params.length > 0 && (
                            <div className="space-y-2">
                              <Label>Parameters ({op.params.length})</Label>
                              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                {op.params.map((param) => (
                                  <Badge key={param.name} variant={param.in === 'path' ? 'default' : 'secondary'} className="gap-1">
                                    {param.name}
                                    <span className="text-xs opacity-70">({param.in})</span>
                                    {param.required && <span className="text-xs">*</span>}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SQL Query */}
                          <div className="space-y-2">
                            <Label htmlFor={`${op.id}-sql`}>SQL Query</Label>
                            <Textarea
                              id={`${op.id}-sql`}
                              value={op.sql}
                              onChange={(e) => updateOperation(op.id, { sql: e.target.value })}
                              className="font-mono text-xs min-h-[120px] bg-slate-50 dark:bg-slate-900/50"
                              placeholder="SQL query..."
                            />
                          </div>

                          {/* Access Control */}
                          <div className="border-t pt-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-base font-semibold">Access Control</Label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                  <Label htmlFor={`${op.id}-protected`} className="font-medium cursor-pointer">
                                    Require Authentication
                                  </Label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Only authenticated users can access this endpoint
                                </p>
                              </div>
                              <Switch
                                id={`${op.id}-protected`}
                                checked={op.isProtected}
                                onCheckedChange={() => toggleProtection(op.id)}
                              />
                            </div>

                            {op.isProtected && projectRoleNames.length > 0 && (
                              <div className="space-y-2 pl-4 border-l-2 border-purple-200 dark:border-purple-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm font-medium">Allowed Roles (optional)</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Leave empty to allow all authenticated users, or select specific roles
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {projectRoleNames.map((role) => (
                                    <Badge
                                      key={role}
                                      variant={op.allowedRoles.includes(role) ? 'default' : 'outline'}
                                      className="cursor-pointer transition-all hover:scale-105"
                                      onClick={() => toggleRole(op.id, role)}
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Disabled message */}
                      {!op.enabled && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm text-amber-900 dark:text-amber-100">
                              This operation is disabled and will not be created. Enable it using the toggle above to configure and include it.
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </>
        )}

        <DialogFooter className="border-t border-slate-200 dark:border-slate-700 p-6 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEndpoints} 
            disabled={loading || enabledCount === 0 || fetchingColumns}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[180px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating {enabledCount} endpoint{enabledCount > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create {enabledCount} endpoint{enabledCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
