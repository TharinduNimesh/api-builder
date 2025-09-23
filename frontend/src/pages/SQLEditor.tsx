import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Save, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";

const SQLEditor = () => {
  const [sql, setSql] = useState("SELECT now();");
  const [runAsMigration, setRunAsMigration] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    status: 'success' | 'error' | 'loading' | null;
    message: string;
    rows?: number;
    data?: any[];
  }>({
    status: 'success',
    message: 'Query executed — 1 rows returned',
    rows: 1,
    data: [{ now: '2024-01-15 10:30:45.123456+00' }]
  });

  const queryHistory = [
    { 
      query: "SELECT * FROM users LIMIT 5;", 
      timestamp: "2 minutes ago", 
      status: "success",
      rows: 5 
    },
    { 
      query: "CREATE TABLE posts (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title TEXT NOT NULL\n);", 
      timestamp: "5 minutes ago", 
      status: "success",
      rows: 0
    },
    { 
      query: "SELECT COUNT(*) FROM invalid_table;", 
      timestamp: "10 minutes ago", 
      status: "error",
      rows: 0
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'loading':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SQL Editor</h1>
            <p className="text-muted-foreground">
              Write and execute SQL queries against your database
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* SQL Editor */}
            <div className="xl:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Query Editor</CardTitle>
                      <CardDescription>
                        Write your SQL queries below
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="migration"
                          checked={runAsMigration}
                          onCheckedChange={setRunAsMigration}
                        />
                        <Label htmlFor="migration" className="text-sm">
                          Run as migration
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save snippet
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    placeholder="SELECT now();"
                    className="min-h-[300px] font-mono text-sm bg-code-background text-code-foreground"
                    style={{ 
                      fontFamily: 'Ubuntu Mono, monospace',
                      resize: 'vertical'
                    }}
                  />
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Results</CardTitle>
                    {queryResult.status && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(queryResult.status)}
                        <Badge className={getStatusColor(queryResult.status)}>
                          {queryResult.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {queryResult.status === 'success' && queryResult.data ? (
                    <div className="space-y-4">
                      <p className="text-sm text-success">{queryResult.message}</p>
                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(queryResult.data[0] || {}).map((key) => (
                                <th key={key} className="text-left p-3 font-medium text-sm">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.data.map((row, index) => (
                              <tr key={index} className="border-t">
                                {Object.values(row).map((value: any, colIndex) => (
                                  <td key={colIndex} className="p-3 text-sm font-mono">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : queryResult.status === 'error' ? (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-destructive text-sm">
                        Error — check SQL syntax
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      Run a query to see results here
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* History Sidebar */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Query History</CardTitle>
                  <CardDescription>
                    Recently executed queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {queryHistory.map((item, index) => (
                      <div 
                        key={index}
                        className="p-3 border border-border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setSql(item.query)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          {getStatusIcon(item.status)}
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp}
                          </span>
                        </div>
                        <code className="text-xs text-foreground line-clamp-3 font-mono">
                          {item.query}
                        </code>
                        {item.rows > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.rows} rows
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SQLEditor;