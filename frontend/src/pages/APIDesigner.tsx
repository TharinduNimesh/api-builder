import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopBar } from "@/components/layout/TopBar";
import { EndpointWizardDialog, DeleteConfirmDialog, RunEndpointDialog } from "@/components/endpoints";
import { listEndpoints, deleteEndpoint, type EndpointData } from "@/services/endpoints";
import { getProject } from "@/services/project";
import { notifySuccess, notifyError } from "@/lib/notify";
import { 
  Map, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  Shield,
  Globe,
  Eye,
  Copy,
  Play
} from "lucide-react";

const APIDesigner = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<EndpointData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endpointToDelete, setEndpointToDelete] = useState<EndpointData | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [endpointToRun, setEndpointToRun] = useState<EndpointData | null>(null);
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [projectRoleNames, setProjectRoleNames] = useState<string[]>([]);

  useEffect(() => {
    loadEndpoints();
    loadProjectRoles();
  }, []);

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      const data = await listEndpoints();
      setEndpoints(data);
    } catch (error) {
      notifyError("Failed to load endpoints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectRoles = async () => {
    try {
      const project = await getProject();
      if (project.enable_roles && project.roles) {
        const roles = Array.isArray(project.roles) ? project.roles : [];
        setProjectRoleNames(roles.map((r: any) => r.name || r));
      } else {
        setProjectRoleNames(["admin", "user", "guest"]);
      }
    } catch (error) {
      console.error("Failed to load project roles:", error);
      setProjectRoleNames(["admin", "user", "guest"]);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    try {
      await deleteEndpoint(id);
      notifySuccess("Endpoint deleted successfully");
      loadEndpoints();
      setDeleteDialogOpen(false);
      setEndpointToDelete(null);
    } catch (error) {
      notifyError("Failed to delete endpoint");
      console.error(error);
    }
  };

  const openDeleteDialog = (endpoint: EndpointData) => {
    setEndpointToDelete(endpoint);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (endpoint: EndpointData) => {
    setEditEndpoint(endpoint);
    setCreateOpen(true);
  };

  const openRunDialog = (endpoint: EndpointData) => {
    setEndpointToRun(endpoint);
    setRunDialogOpen(true);
  };

  const handleWizardClose = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setEditEndpoint(null);
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = 
      searchQuery === "" ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (endpoint.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesMethod = 
      methodFilter === "all" || 
      endpoint.method.toLowerCase() === methodFilter.toLowerCase();
    
    const matchesAccess = 
      accessFilter === "all" ||
      (accessFilter === "public" && !endpoint.is_active) ||
      (accessFilter === "protected" && endpoint.is_active);

    return matchesSearch && matchesMethod && matchesAccess;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700";
      case "POST": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
      case "PUT": return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700";
      case "DELETE": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const copyToClipboard = (text: string) => {
    const fullPath = `/api/b${text}`;
    navigator.clipboard.writeText(fullPath);
    notifySuccess("Endpoint path copied to clipboard");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">API Designer</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage REST API endpoints and access control
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Endpoint
              </Button>
            </div>
          </div>

          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search endpoints..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="get">GET</SelectItem>
                    <SelectItem value="post">POST</SelectItem>
                    <SelectItem value="put">PUT</SelectItem>
                    <SelectItem value="delete">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accessFilter} onValueChange={setAccessFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Access Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Endpoints</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{endpoints.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Map className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {endpoints.filter(e => e.is_active).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtered</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredEndpoints.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">Loading endpoints...</p>
              </CardContent>
            </Card>
          ) : filteredEndpoints.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {endpoints.length === 0 ? "No Endpoints Yet" : "No Matching Endpoints"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 max-w-md">
                  {endpoints.length === 0 
                    ? "Get started by creating your first API endpoint"
                    : "Try adjusting your filters or search query"
                  }
                </p>
                {endpoints.length === 0 && (
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Create First Endpoint
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEndpoints.map((endpoint) => (
                <Card key={endpoint.id} className="border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Badge className={`font-bold text-xs border whitespace-nowrap ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </Badge>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {endpoint.path}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 flex-shrink-0"
                              onClick={() => copyToClipboard(endpoint.path)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {endpoint.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {endpoint.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={
                                endpoint.is_protected 
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400" 
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }
                            >
                              {endpoint.is_protected ? (
                                <>
                                  <Shield className="h-3 w-3 mr-1" />
                                  Protected
                                </>
                              ) : (
                                <>
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              )}
                            </Badge>
                            
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Created {new Date(endpoint.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openRunDialog(endpoint)}
                          title="Test endpoint"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(endpoint)}
                          title="Edit endpoint"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(endpoint)}
                          title="Delete endpoint"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <EndpointWizardDialog
        open={createOpen}
        projectRoleNames={projectRoleNames}
        editEndpoint={editEndpoint}
        onOpenChange={handleWizardClose}
        onSuccess={loadEndpoints}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        endpointPath={endpointToDelete?.path || ''}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => endpointToDelete && handleDeleteEndpoint(endpointToDelete.id)}
      />

      <RunEndpointDialog
        open={runDialogOpen}
        endpoint={endpointToRun}
        onOpenChange={setRunDialogOpen}
      />
    </div>
  );
};

export default APIDesigner;
