import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Zap, 
  Plus, 
  Search, 
  Code, 
  Play, 
  ExternalLink, 
  Settings, 
  Trash2, 
  Edit3,
  Clock,
  ArrowRight,
  MapPin
} from "lucide-react";

const Functions = () => {
  const functions = [
    {
      name: "search_posts",
      description: "Search posts by title and content with full-text search",
      returnType: "TABLE(id integer, title text, content text, created_at timestamp)",
      parameters: "query text",
      created: "2 days ago",
      lastUsed: "5 minutes ago",
      mapped: true,
      endpoint: "/rpc/search_posts"
    },
    {
      name: "get_user_stats",
      description: "Get comprehensive user statistics and activity metrics",
      returnType: "json",
      parameters: "user_id integer",
      created: "1 week ago",
      lastUsed: "2 hours ago",
      mapped: true,
      endpoint: "/rpc/get_user_stats"
    },
    {
      name: "calculate_metrics",
      description: "Calculate performance metrics for the dashboard",
      returnType: "json",
      parameters: "date_from date, date_to date",
      created: "3 days ago",
      lastUsed: "Never",
      mapped: false,
      endpoint: null
    },
    {
      name: "update_post_views",
      description: "Increment post view count and update analytics",
      returnType: "void",
      parameters: "post_id integer",
      created: "1 week ago",
      lastUsed: "1 minute ago",
      mapped: true,
      endpoint: "/rpc/update_post_views"
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Functions</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage PostgreSQL functions and map them to REST endpoints
              </p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Function
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search functions..." 
                    className="pl-10"
                  />
                </div>
                <Badge variant="outline" className="hover:bg-orange-50 hover:border-orange-200 cursor-pointer">
                  All Functions ({functions.length})
                </Badge>
                <Badge variant="outline" className="hover:bg-orange-50 hover:border-orange-200 cursor-pointer">
                  Mapped ({functions.filter(f => f.mapped).length})
                </Badge>
                <Badge variant="outline" className="hover:bg-orange-50 hover:border-orange-200 cursor-pointer">
                  Unmapped ({functions.filter(f => !f.mapped).length})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Functions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {functions.map((func, index) => (
              <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
                          {func.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {func.mapped ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              Mapped
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Unmapped
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs font-mono">
                            {func.returnType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {func.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Parameters:</span>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                        {func.parameters}
                      </code>
                    </div>
                    {func.mapped && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Endpoint:</span>
                        <code className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded font-mono">
                          {func.endpoint}
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {func.created}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Last used: {func.lastUsed}
                      </p>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-1" />
                        View SQL
                      </Button>
                      {func.mapped ? (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Test API
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                          <MapPin className="h-4 w-4 mr-1" />
                          Map to API
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Function Card */}
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Create New Function</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 max-w-md">
                Write custom PostgreSQL functions to extend your API capabilities
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Create Function
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Functions;
