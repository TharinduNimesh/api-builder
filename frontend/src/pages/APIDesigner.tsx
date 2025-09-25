import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Map, 
  Plus, 
  Search, 
  ExternalLink, 
  Settings, 
  Trash2, 
  Edit3,
  Shield,
  Globe,
  Lock,
  Users,
  Eye,
  Activity,
  Clock,
  Filter,
  Copy
} from "lucide-react";

const APIDesigner = () => {
  const userRole = "admin"; // This would come from auth context
  
  const endpoints = [
    {
      method: "GET",
      path: "/users",
      description: "Get all users with pagination",
      table: "users",
      access: ["admin", "developer", "viewer"],
      status: "active",
      requests: "2.4k",
      lastUsed: "2 minutes ago",
      responseTime: "45ms"
    },
    {
      method: "GET",
      path: "/users/:id",
      description: "Get a specific user by ID",
      table: "users",
      access: ["admin", "developer", "viewer"],
      status: "active",
      requests: "891",
      lastUsed: "5 minutes ago",
      responseTime: "23ms"
    },
    {
      method: "POST",
      path: "/users",
      description: "Create a new user",
      table: "users",
      access: ["admin", "developer"],
      status: "active",
      requests: "156",
      lastUsed: "1 hour ago",
      responseTime: "67ms"
    },
    {
      method: "PUT",
      path: "/users/:id",
      description: "Update user information",
      table: "users",
      access: ["admin", "developer"],
      status: "active",
      requests: "234",
      lastUsed: "30 minutes ago",
      responseTime: "52ms"
    },
    {
      method: "DELETE",
      path: "/users/:id",
      description: "Delete a user",
      table: "users",
      access: ["admin"],
      status: "active",
      requests: "12",
      lastUsed: "2 days ago",
      responseTime: "34ms"
    },
    {
      method: "GET",
      path: "/posts",
      description: "Get all posts with filtering and sorting",
      table: "posts",
      access: ["admin", "developer", "viewer"],
      status: "active",
      requests: "5.1k",
      lastUsed: "1 minute ago",
      responseTime: "78ms"
    },
    {
      method: "POST",
      path: "/rpc/search_posts",
      description: "Full-text search across posts",
      table: "search_posts()",
      access: ["admin", "developer", "viewer"],
      status: "active",
      requests: "445",
      lastUsed: "10 minutes ago",
      responseTime: "145ms"
    },
    {
      method: "POST",
      path: "/rpc/get_user_stats",
      description: "Get comprehensive user statistics",
      table: "get_user_stats()",
      access: ["admin", "developer"],
      status: "active",
      requests: "89",
      lastUsed: "1 hour ago",
      responseTime: "234ms"
    }
  ];

  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.access.includes(userRole)
  );

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700";
      case "POST": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
      case "PUT": return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700";
      case "DELETE": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getAccessIcon = (access: string[]) => {
    if (access.includes("viewer")) return <Globe className="h-3 w-3" />;
    if (access.includes("developer")) return <Users className="h-3 w-3" />;
    return <Lock className="h-3 w-3" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">API Designer</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage REST API endpoints and access control
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700">
                <Shield className="h-3 w-3 mr-1" />
                Role: {userRole}
              </Badge>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Endpoint
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search endpoints..." 
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
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
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Access Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="developer">Developer+</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Endpoints</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredEndpoints.length}</p>
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
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available to You</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredEndpoints.length}</p>
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
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Response</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">78ms</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">9.4k</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endpoints List */}
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, index) => (
              <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Badge className={`font-bold text-xs border ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </Badge>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {endpoint.path}
                          </code>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {endpoint.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Target: <code className="font-mono">{endpoint.table}</code>
                          </span>
                          <div className="flex items-center gap-1">
                            {getAccessIcon(endpoint.access)}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {endpoint.access.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{endpoint.requests}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">requests</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{endpoint.responseTime}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">avg response</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {endpoint.lastUsed}
                        </p>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs mt-1">
                          <Activity className="h-3 w-3 mr-1" />
                          {endpoint.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        {userRole === "admin" && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Endpoint Card */}
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Create New Endpoint</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 max-w-md">
                Map database tables and functions to REST API endpoints with custom access control
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Map className="h-4 w-4 mr-2" />
                Create Endpoint
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default APIDesigner;
