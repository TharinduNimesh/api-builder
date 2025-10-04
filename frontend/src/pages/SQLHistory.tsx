import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, Clock, Database, Activity, TrendingUp, Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { getAllQueryHistory, type QueryHistory } from "@/services/sql";
import { notifyError } from "@/lib/notify";

const SQLHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  
  // Stats
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [avgExecutionTime, setAvgExecutionTime] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getAllQueryHistory(page, pageSize);
      setHistory(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      
      // Calculate stats
      const successful = response.data.filter(h => h.status === 'success').length;
      const failed = response.data.filter(h => h.status === 'error').length;
      const avgTime = response.data
        .filter(h => h.executionTime)
        .reduce((acc, h) => acc + (h.executionTime || 0), 0) / response.data.length || 0;
      
      setSuccessCount(successful);
      setErrorCount(failed);
      setAvgExecutionTime(avgTime);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to load query history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const loadQueryToEditor = (query: string) => {
    // Store in localStorage to pass to editor
    localStorage.setItem('sqlEditorQuery', query);
    navigate('/sql');
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/sql')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Query History</h1>
              <p className="text-muted-foreground">
                All your executed SQL queries
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Queries</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Executed queries
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Successful</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{successCount}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {total > 0 ? Math.round((successCount / total) * 100) : 0}% success rate
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Failed</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{errorCount}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Query errors
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Execution</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {avgExecutionTime > 0 ? avgExecutionTime.toFixed(1) : '0'}
                  <span className="text-sm font-normal text-slate-500">ms</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3" />
                  Performance metric
                </p>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Click on any query to load it in the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mx-auto mb-4">
                    <Database className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No query history found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start executing queries to see them here</p>
                  <Button
                    onClick={() => navigate('/sql')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Go to SQL Editor
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer transition-colors"
                      onClick={() => loadQueryToEditor(item.query)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge 
                            variant={item.status === 'success' ? 'default' : 'destructive'}
                            className={item.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' : ''}
                          >
                            {item.status}
                          </Badge>
                          {item.executionTime && (
                            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.executionTime.toFixed(2)}ms
                            </Badge>
                          )}
                          {item.rowsAffected !== undefined && item.rowsAffected !== null && (
                            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                              {item.rowsAffected} row{item.rowsAffected !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>
                      
                      <ScrollArea className="max-h-32">
                        <code className="text-sm font-mono block whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                          {item.query}
                        </code>
                      </ScrollArea>
                      
                      {item.errorMessage && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-xs text-red-700 dark:text-red-400 font-mono">
                            {item.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} • Showing {history.length} of {total} queries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SQLHistory;
