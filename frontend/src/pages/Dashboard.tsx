import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Table, Zap, Map, Activity, Clock, ArrowRight, Code2, Shield, Lock, Users, Eye, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { getTables } from "@/services/tables";
import { listFunctions } from "@/services/functions";
import { listEndpoints } from "@/services/endpoints";
import { getQueryHistory } from "@/services/sql";
import { getProject } from "@/services/project";
import { useNavigate } from "react-router-dom";
import type { FunctionData } from "@/services/functions";
import type { EndpointData } from "@/services/endpoints";
import type { QueryHistory } from "@/services/sql";

interface TableData {
  id: string;
  name: string;
  schema: string;
  row_count?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<TableData[]>([]);
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [recentQueries, setRecentQueries] = useState<QueryHistory[]>([]);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tablesData, functionsData, endpointsData, queriesData, projectData] = await Promise.all([
        getTables(),
        listFunctions(),
        listEndpoints(),
        getQueryHistory(5),
        getProject(),
      ]);

      setTables(tablesData);
      setFunctions(functionsData);
      setEndpoints(endpointsData);
      setRecentQueries(queriesData);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeEndpoints = endpoints.filter(e => e.is_active);
  const protectedEndpoints = endpoints.filter(e => e.is_protected);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
        <TopBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Overview of your API project: {project?.name || 'Unnamed Project'}
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/tables')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Database Tables</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tables.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3" />
                  Click to manage tables
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/functions')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">SQL Functions</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{functions.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Code2 className="h-3 w-3" />
                  PostgreSQL functions
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/api-designer')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">API Endpoints</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Map className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{endpoints.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3 text-green-600" />
                  {activeEndpoints.length} active
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/sql-history')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">SQL Queries</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Code2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{recentQueries.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  Recent executions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Protected Endpoints</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {protectedEndpoints.length} / {endpoints.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Auth Enabled</span>
                    <Badge className={project?.is_protected ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}>
                      {project?.is_protected ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Roles Enabled</span>
                    <Badge className={project?.enable_roles ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}>
                      {project?.enable_roles ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  Endpoint Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {activeEndpoints.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Inactive</span>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      {endpoints.length - activeEndpoints.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                    <Badge variant="outline">
                      {endpoints.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Signup Enabled</span>
                    <Badge className={project?.signup_enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}>
                      {project?.signup_enabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Default Role</span>
                    <Badge variant="outline">
                      {project?.default_role || 'None'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Roles</span>
                    <Badge variant="outline">
                      {project?.roles?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Tables */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Database Tables</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your database tables and schemas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tables.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No tables found</p>
                    <Button variant="outline" onClick={() => navigate('/tables')} className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                      <Database className="h-4 w-4 mr-2" />
                      Go to Tables
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {tables.slice(0, 5).map((table) => (
                        <div key={table.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{table.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Schema: {table.schema}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => navigate('/tables')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {tables.length > 5 && (
                      <div className="pt-4">
                        <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800" onClick={() => navigate('/tables')}>
                          <Database className="h-4 w-4 mr-2" />
                          View all {tables.length} tables
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Endpoints</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your REST API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                {endpoints.length === 0 ? (
                  <div className="text-center py-8">
                    <Map className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No endpoints created yet</p>
                    <Button variant="outline" onClick={() => navigate('/api-designer')} className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                      <Map className="h-4 w-4 mr-2" />
                      Create Endpoint
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {endpoints.slice(0, 5).map((endpoint) => (
                        <div key={endpoint.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${
                                endpoint.method === 'GET' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' :
                                endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700' :
                                'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{endpoint.path}</p>
                              {endpoint.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{endpoint.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {endpoint.is_protected && (
                              <Lock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            )}
                            <Badge className={endpoint.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}>
                              {endpoint.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    {endpoints.length > 5 && (
                      <div className="pt-4">
                        <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800" onClick={() => navigate('/api-designer')}>
                          <Map className="h-4 w-4 mr-2" />
                          View all {endpoints.length} endpoints
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Functions and Recent Queries Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* SQL Functions */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">SQL Functions</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  PostgreSQL functions in your database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {functions.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No functions found</p>
                    <Button variant="outline" onClick={() => navigate('/functions')} className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                      <Zap className="h-4 w-4 mr-2" />
                      Go to Functions
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {functions.slice(0, 5).map((func) => (
                        <div key={func.id || func.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{func.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {func.schema}.{func.name}({func.parameters || ''})
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {func.return_type || 'void'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {functions.length > 5 && (
                      <div className="pt-4">
                        <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800" onClick={() => navigate('/functions')}>
                          <Zap className="h-4 w-4 mr-2" />
                          View all {functions.length} functions
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent SQL Queries */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent SQL Queries</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your most recent SQL executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentQueries.length === 0 ? (
                  <div className="text-center py-8">
                    <Code2 className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No queries executed yet</p>
                    <Button variant="outline" onClick={() => navigate('/sql-editor')} className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                      <Code2 className="h-4 w-4 mr-2" />
                      Open SQL Editor
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {recentQueries.map((query) => (
                        <div key={query.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={query.status === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
                              {query.status}
                            </Badge>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(query.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <code className="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-2 block bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            {query.query}
                          </code>
                          {query.executionTime && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              Execution time: {query.executionTime}ms
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800" onClick={() => navigate('/sql-history')}>
                        <Code2 className="h-4 w-4 mr-2" />
                        View query history
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700" onClick={() => navigate('/sql-editor')}>
                  <Code2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">SQL Editor</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700" onClick={() => navigate('/api-designer')}>
                  <Map className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">API Designer</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700" onClick={() => navigate('/tables')}>
                  <Database className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">Manage Tables</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700" onClick={() => navigate('/settings')}>
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;