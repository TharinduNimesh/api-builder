import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Users, 
  Database,
  Zap,
  Globe,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

const Metrics = () => {
  // Mock data for preview
  const mockStats = [
    { label: "Total Requests", value: "12.4k", change: "+23%", trend: "up" },
    { label: "Avg Response Time", value: "145ms", change: "-12%", trend: "down" },
    { label: "Active Users", value: "1,234", change: "+5%", trend: "up" },
    { label: "Error Rate", value: "0.3%", change: "0%", trend: "stable" }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-3 w-3 text-green-600" />;
      case "down": return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-slate-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600 dark:text-green-400";
      case "down": return "text-red-600 dark:text-red-400";
      default: return "text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Metrics</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Analytics and performance insights for your API
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 days
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {mockStats.map((stat, index) => (
              <Card key={index} className="border border-slate-200 dark:border-slate-700 opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                    </div>
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(stat.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Card className="max-w-2xl w-full border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-900/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-8">
                  <BarChart3 className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
                
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700 mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
                
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Advanced Analytics Dashboard
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                  We're building comprehensive analytics and performance metrics for your API. 
                  Get insights into usage patterns, performance trends, and user behavior.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Performance Trends</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Response times, throughput, and error rates</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">User Analytics</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Usage patterns and user behavior</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Real-time Monitoring</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live API health and status updates</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Analytics
                  </Button>
                  <Button variant="outline" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Get Updates
                  </Button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
                  Expected release: Q2 2024 • We'll notify you when it's ready
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-40">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                    <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Endpoint Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">/users</span>
                  <span className="text-xs font-medium">2.4k requests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">/posts</span>
                  <span className="text-xs font-medium">1.8k requests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">/auth</span>
                  <span className="text-xs font-medium">945 requests</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                    <Database className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Database Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Query Time</span>
                  <span className="text-xs font-medium">23ms avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Connections</span>
                  <span className="text-xs font-medium">45 active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Cache Hit</span>
                  <span className="text-xs font-medium">94.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                    <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Error Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">4xx Errors</span>
                  <span className="text-xs font-medium">0.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">5xx Errors</span>
                  <span className="text-xs font-medium">0.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Timeouts</span>
                  <span className="text-xs font-medium">0.0%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Metrics;
