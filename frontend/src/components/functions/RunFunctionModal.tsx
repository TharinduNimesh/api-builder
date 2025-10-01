import { useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, CheckCircle2, XCircle, Database, Copy, AlertCircle } from 'lucide-react';
import type { FunctionData } from '@/services/functions';
import { runFunction } from '@/services/functions';
import { notifySuccess, notifyError } from '@/lib/notify';

interface RunFunctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  functionData: FunctionData | null;
}

export function RunFunctionModal({ open, onOpenChange, functionData }: RunFunctionModalProps) {
  const [paramInputs, setParamInputs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [resultRows, setResultRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Parse parameters from functionData.parameters ("a integer, b text") into simple placeholders
  const paramsList = useMemo(() => {
    if (!functionData?.parameters) return [];
    // split by comma but avoid commas inside parens
    return functionData.parameters.split(/,(?![^()]*\))/).map(p => p.trim());
  }, [functionData]);

  useEffect(() => {
    // reset inputs when modal opens
    if (open) {
      setParamInputs(paramsList.map(() => ''));
      setResultRows(null);
      setError(null);
      setExecutionTime(null);
    }
  }, [open, paramsList]);

  const handleChange = (idx: number, val: string) => {
    const copy = [...paramInputs];
    copy[idx] = val;
    setParamInputs(copy);
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setResultRows(null);
    setExecutionTime(null);
    
    const startTime = performance.now();
    try {
      const args = paramInputs.map(v => v === '' ? null : (isNaN(Number(v)) ? v : Number(v)));
      const resp = await runFunction(functionData?.schema || 'public', functionData?.name || '', args);
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      
      if (resp?.status === 'ok') {
        setResultRows(resp.rows || []);
        if (resp.rows && resp.rows.length > 0) {
          notifySuccess(`Function executed successfully - ${resp.rows.length} row(s) returned`);
        }
      } else if (resp?.rows) {
        setResultRows(resp.rows);
      } else {
        setResultRows([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to run function');
      notifyError(err?.message || 'Failed to run function');
    } finally {
      setRunning(false);
    }
  };

  const copyResultsToClipboard = () => {
    if (!resultRows || resultRows.length === 0) return;
    const text = JSON.stringify(resultRows, null, 2);
    navigator.clipboard.writeText(text);
    notifySuccess('Results copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Run Function</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  {functionData?.schema || 'public'}.{functionData?.name}
                </code>
                {functionData?.return_type && (
                  <Badge variant="outline" className="text-xs">
                    → {functionData.return_type}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleRun} className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Parameters Section */}
          {paramsList.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Input Parameters</Label>
                  <Badge variant="secondary" className="text-xs">
                    {paramsList.length} parameter{paramsList.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {paramsList.map((p, idx) => {
                    // Parse parameter name and type
                    const parts = p.split(/\s+/);
                    const paramName = parts[0] || `param${idx + 1}`;
                    const paramType = parts.slice(1).join(' ') || 'any';
                    
                    return (
                      <div key={idx} className="grid grid-cols-[140px_1fr] gap-3 items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{paramName}</span>
                          <span className="text-xs text-muted-foreground font-mono">{paramType}</span>
                        </div>
                        <Input 
                          value={paramInputs[idx] || ''} 
                          onChange={(e) => handleChange(idx, e.target.value)}
                          placeholder={`Enter ${paramName}`}
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {paramsList.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This function requires no parameters.
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Results</Label>
                  {executionTime !== null && (
                    <Badge variant="secondary" className="text-xs">
                      {executionTime.toFixed(2)}ms
                    </Badge>
                  )}
                  {resultRows !== null && (
                    <Badge variant="outline" className="text-xs">
                      {resultRows.length} row{resultRows.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {resultRows && resultRows.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyResultsToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy JSON
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 border rounded-lg">
                {running ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Executing function...</p>
                  </div>
                ) : resultRows && resultRows.length > 0 ? (
                  <div className="p-2">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                        <tr>
                          {Object.keys(resultRows[0]).map((k) => (
                            <th key={k} className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide border-b">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultRows.map((r, ri) => (
                          <tr key={ri} className="border-b hover:bg-muted/50 transition-colors">
                            {Object.keys(resultRows[0]).map((k) => (
                              <td key={k} className="px-3 py-2 align-top font-mono text-xs">
                                {r[k] === null ? (
                                  <span className="text-muted-foreground italic">null</span>
                                ) : typeof r[k] === 'boolean' ? (
                                  <Badge variant={r[k] ? 'default' : 'secondary'} className="text-xs">
                                    {String(r[k])}
                                  </Badge>
                                ) : (
                                  String(r[k])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : resultRows && resultRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
                    <p className="text-sm font-medium">Function executed successfully</p>
                    <p className="text-xs text-muted-foreground mt-1">No rows returned</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Database className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Click "Run Function" to execute</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <DialogFooter className="flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={running}>
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Function
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
