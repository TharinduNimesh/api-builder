import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Copy, Check, AlertCircle, Loader2, Clock } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { EndpointData } from "@/services/endpoints";
import { getAccessToken } from "@/lib/auth";

interface RunEndpointDialogProps {
  open: boolean;
  endpoint: EndpointData | null;
  onOpenChange: (open: boolean) => void;
}

interface ParamValue {
  [key: string]: string;
}

export function RunEndpointDialog({
  open,
  endpoint,
  onOpenChange,
}: RunEndpointDialogProps) {
  const [paramValues, setParamValues] = useState<ParamValue>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  // Clear response/error when dialog opens
  useEffect(() => {
    if (open) {
      setResponse(null);
      setError(null);
      setCopied(false);
      setViewMode('table');
    }
  }, [open]);

  if (!endpoint) return null;

  // Extract parameters from path
  const pathParams = endpoint.path.match(/{([^}]+)}/g)?.map(p => p.slice(1, -1)) || [];
  
  // Parse SQL for parameters
  const sqlParams = endpoint.sql.match(/{([^}]+)}/g)?.map(p => p.slice(1, -1)) || [];
  
  // Combine and deduplicate
  const allParams = Array.from(new Set([...pathParams, ...sqlParams]));

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Build the path with /api/b prefix and path parameters
      const apiBaseRaw = (import.meta.env.VITE_API_BASE as string) || '';
      const apiBase = apiBaseRaw.replace(/\/$/, '');
      // Start with the endpoint path and replace path params
      let pathWithParams = `/api/b${endpoint.path}`;
      pathParams.forEach((param) => {
        pathWithParams = pathWithParams.replace(
          `{${param}}`,
          encodeURIComponent(paramValues[param] || '')
        );
      });

      // Normalize duplicate slashes in the path portion
      pathWithParams = pathWithParams.replace(/([^:]\/)\//g, '$1');

      // Decide on absolute origin: if VITE_API_BASE is set and looks like an origin (starts with http), use it;
      // otherwise fallback to window.location.origin
      const origin = apiBase && /^https?:\/\//i.test(apiBase) ? apiBase : window.location.origin;

      // Final URL is origin + normalized path
      const finalUrl = `${origin}${pathWithParams}`;

      // Build query string for non-path parameters
      const queryParams = sqlParams.filter(p => !pathParams.includes(p));
      if (queryParams.length > 0 && endpoint.method === 'GET') {
        const query = new URLSearchParams(
          queryParams.reduce((acc, param) => {
            if (paramValues[param]) {
              acc[param] = paramValues[param];
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        if (query) pathWithParams += `?${query}`;
      }

      // Build request body for POST/PUT
      let body = undefined;
      if (['POST', 'PUT'].includes(endpoint.method)) {
        const bodyParams = sqlParams.filter(p => !pathParams.includes(p));
        if (bodyParams.length > 0) {
          body = JSON.stringify(
            bodyParams.reduce((acc, param) => {
              if (paramValues[param]) {
                acc[param] = paramValues[param];
              }
              return acc;
            }, {} as Record<string, string>)
          );
        }
      }

      // Make the request - use centralized access token
      const token = getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(finalUrl, {
        method: endpoint.method,
        headers,
        body,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      setResponse(data);
      notifySuccess('Request completed successfully');
    } catch (err: any) {
      setError(err.message);
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      notifySuccess('Response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400";
      case "POST": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400";
      case "PUT": return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400";
      case "DELETE": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Play className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle>Test Endpoint</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`font-bold text-xs border ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </Badge>
                <code className="text-xs font-mono text-slate-600 dark:text-slate-400">{endpoint.path}</code>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
          {/* Parameters */}
          {allParams.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Parameters</Label>
                <Badge variant="outline" className="text-xs">
                  {allParams.length} parameter{allParams.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                {allParams.map((param) => (
                  <div key={param} className="space-y-1.5">
                    <Label htmlFor={param} className="text-sm flex items-center gap-2">
                      <span className="font-medium">{param}</span>
                      <Badge variant="outline" className="text-xs">
                        {pathParams.includes(param) ? 'path' : 'query/body'}
                      </Badge>
                    </Label>
                    <Input
                      id={param}
                      placeholder={`Enter ${param}`}
                      value={paramValues[param] || ''}
                      onChange={(e) =>
                        setParamValues({ ...paramValues, [param]: e.target.value })
                      }
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {allParams.length === 0 && (
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Ready to test</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No parameters required for this endpoint
              </p>
            </div>
          )}

          {/* Response */}
          {(response || error) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Response</Label>
              </div>
              
              {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Request Failed</p>
                      <p className="text-sm text-red-800 dark:text-red-200 break-words">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                  {/* Success banner with execution time */}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Success</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-green-700 dark:text-green-300">
                        {response?.executionTime != null && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{response.executionTime.toFixed(2)}ms</span>
                          </div>
                        )}
                        {response?.rowsAffected != null && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{response.rowsAffected}</span>
                            <span>row{response.rowsAffected !== 1 ? 's' : ''} affected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabbed view for Table/JSON */}
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'json')} className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <TabsList>
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="json">JSON View</TabsTrigger>
                      </TabsList>
                      {viewMode === 'json' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyResponse}
                          className="h-7"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy JSON
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <TabsContent value="table" className="mt-0">
                      {response?.rows && Array.isArray(response.rows) && response.rows.length > 0 ? (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                {Object.keys(response.rows[0]).map((key) => (
                                  <TableHead key={key} className="font-semibold">
                                    {key}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {response.rows.map((row: any, idx: number) => (
                                <TableRow key={idx}>
                                  {Object.values(row).map((value: any, cellIdx: number) => (
                                    <TableCell key={cellIdx}>
                                      {value === null ? (
                                        <span className="text-slate-400 italic">null</span>
                                      ) : typeof value === 'object' ? (
                                        <code className="text-xs">{JSON.stringify(value)}</code>
                                      ) : (
                                        String(value)
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            No data rows returned
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="json" className="mt-0">
                      <Textarea
                        value={JSON.stringify(response, null, 2)}
                        readOnly
                        className="font-mono text-xs h-64 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleRun}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
