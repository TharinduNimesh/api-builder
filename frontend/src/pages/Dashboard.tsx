import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Table, Zap, Map, TrendingUp, Activity, Clock, ArrowRight, BarChart3 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";

const Dashboard = () => {
  const projectStats = {
    tables: 3,
    functions: 2,
    mappings: 8,
    requests: "1.2k"
  };

  const recentTables = [
    { name: "users", rows: 1250, created: "2 days ago", growth: "+12%" },
    { name: "posts", rows: 340, created: "1 week ago", growth: "+8%" },
    { name: "comments", rows: 2100, created: "1 week ago", growth: "+24%" }
  ];

  const recentMappings = [
    { path: "/users", method: "GET", target: "users", status: "active", requests: "847" },
    { path: "/users/:id", method: "GET", target: "users", status: "active", requests: "234" },
    { path: "/posts", method: "POST", target: "posts", status: "active", requests: "156" },
    { path: "/rpc/search_posts", method: "POST", target: "search_posts", status: "active", requests: "89" }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Overview of your API project performance
            </p>
          </div>
          
          {/* Stats Cards - Orange and White Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Tables</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Table className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectStats.tables}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Functions</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectStats.functions}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3" />
                  All active
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">API Endpoints</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Map className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectStats.mappings}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Map className="h-3 w-3" />
                  REST mappings
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Requests</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectStats.requests}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Tables */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Tables</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your most recently created database tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTables.map((table, index) => (
                    <div key={table.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Table className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{table.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{table.rows.toLocaleString()} rows</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              {table.growth}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {table.created}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                    <Table className="h-4 w-4 mr-2" />
                    View all tables
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Endpoints</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Active API mappings and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            mapping.method === 'GET' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                            mapping.method === 'POST' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' :
                            'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700'
                          }`}
                        >
                          {mapping.method}
                        </Badge>
                        <div>
                          <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{mapping.path}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">→ {mapping.target}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{mapping.requests}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">requests</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Activity className="h-3 w-3 mr-1" />
                          {mapping.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800">
                    <Map className="h-4 w-4 mr-2" />
                    View all endpoints
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;