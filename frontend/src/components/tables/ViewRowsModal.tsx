import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { getTableRows } from '@/services/tables';
import { notifySuccess, notifyError } from '@/lib/notify';

interface ViewRowsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: {
    name: string;
    schema?: string;
    full_name?: string;
  } | null;
}

export function ViewRowsModal({ open, onOpenChange, table }: ViewRowsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsData, setRowsData] = useState<any[]>([]);
  const [limit, setLimit] = useState(50);

  const fetchRows = async () => {
    if (!table) return;
    
    setLoading(true);
    setError(null);
    try {
      const schema = table.schema || 'public';
      const rows = await getTableRows(schema, table.name, limit);
      setRowsData(rows);
    } catch (err) {
      setError('Failed to fetch table rows');
      notifyError('Failed to load table rows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && table) {
      fetchRows();
    }
  }, [open, table, limit]);

  const copyToClipboard = async (value: any) => {
    try {
      await navigator.clipboard.writeText(String(value));
      notifySuccess('Copied to clipboard');
    } catch (err) {
      notifyError('Failed to copy');
    }
  };

  const exportToCSV = () => {
    if (!rowsData.length) return;
    
    const headers = Object.keys(rowsData[0]);
    const csvContent = [
      headers.join(','),
      ...rowsData.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table?.name || 'table'}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess('CSV downloaded');
  };

  const truncateValue = (value: any, maxLength = 50) => {
    const str = String(value);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Table Rows — {table?.full_name || table?.name}
            <Badge variant="secondary">{rowsData.length} rows</Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Showing up to {limit} rows from the table</span>
            <div className="flex gap-2">
              <select 
                value={limit} 
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
                disabled={loading}
              >
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value={500}>500 rows</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRows}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading rows...
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && rowsData.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No rows found in this table
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && rowsData.length > 0 && (
            <div className="border rounded-lg overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {Object.keys(rowsData[0]).map((column) => (
                      <th key={column} className="p-3 text-left font-medium border-b">
                        <div className="flex items-center gap-1">
                          {column}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => copyToClipboard(column)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/20">
                      {Object.entries(row).map(([key, value], i) => (
                        <td key={i} className="p-3 font-mono text-xs group">
                          <div className="flex items-center gap-1">
                            <span 
                              className="cursor-pointer hover:bg-muted px-1 py-0.5 rounded"
                              title={String(value)}
                              onClick={() => copyToClipboard(value)}
                            >
                              {truncateValue(value)}
                            </span>
                            {String(value).length > 50 && (
                              <Badge variant="secondary" className="text-[10px] opacity-60">
                                +{String(value).length - 50}
                              </Badge>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {rowsData.length > 0 && (
              <Button variant="outline" onClick={exportToCSV} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}