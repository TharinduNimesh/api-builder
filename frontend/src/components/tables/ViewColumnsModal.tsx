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
import { Loader2, Key, AlertCircle, Copy, Database } from 'lucide-react';
import { getTableColumns } from '@/services/tables';
import { notifySuccess, notifyError } from '@/lib/notify';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default?: string;
  character_maximum_length?: number;
  numeric_precision?: number;
  numeric_scale?: number;
  is_identity?: string;
  ordinal_position?: number;
}

interface ViewColumnsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: {
    name: string;
    schema?: string;
    full_name?: string;
  } | null;
}

export function ViewColumnsModal({ open, onOpenChange, table }: ViewColumnsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnsData, setColumnsData] = useState<Column[]>([]);

  const fetchColumns = async () => {
    if (!table) return;
    
    setLoading(true);
    setError(null);
    try {
      const schema = table.schema || 'public';
      const columns = await getTableColumns(schema, table.name);
      setColumnsData(columns.sort((a, b) => (a.ordinal_position || 0) - (b.ordinal_position || 0)));
    } catch (err) {
      setError('Failed to fetch table columns');
      notifyError('Failed to load table columns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && table) {
      fetchColumns();
    }
  }, [open, table]);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      notifySuccess('Copied to clipboard');
    } catch (err) {
      notifyError('Failed to copy');
    }
  };

  const getTypeDisplay = (column: Column) => {
    let type = column.data_type;
    
    if (column.character_maximum_length) {
      type += `(${column.character_maximum_length})`;
    } else if (column.numeric_precision && column.numeric_scale !== undefined) {
      type += `(${column.numeric_precision},${column.numeric_scale})`;
    } else if (column.numeric_precision) {
      type += `(${column.numeric_precision})`;
    }
    
    return type;
  };

  const getConstraintBadges = (column: Column) => {
    const badges = [];
    
    if (column.is_nullable === 'NO') {
      badges.push(<Badge key="not-null" variant="secondary">NOT NULL</Badge>);
    }
    
    if (column.column_default) {
      badges.push(<Badge key="default" variant="outline">DEFAULT</Badge>);
    }
    
    if (column.is_identity === 'YES') {
      badges.push(<Badge key="identity" variant="default">IDENTITY</Badge>);
    }
    
    return badges;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Table Schema — {table?.full_name || table?.name}
            <Badge variant="secondary">{columnsData.length} columns</Badge>
          </DialogTitle>
          <DialogDescription>
            Column definitions and constraints for this table
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading columns...
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

          {!loading && !error && columnsData.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No columns found for this table
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && columnsData.length > 0 && (
            <div className="space-y-2">
              {columnsData.map((column, index) => (
                <Card key={column.column_name} className="transition-colors hover:bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">#{column.ordinal_position || index + 1}</span>
                          <h4 
                            className="font-mono font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded"
                            onClick={() => copyToClipboard(column.column_name)}
                            title="Click to copy column name"
                          >
                            {column.column_name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(column.column_name)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {getTypeDisplay(column)}
                          </Badge>
                          {getConstraintBadges(column)}
                        </div>
                        
                        {column.column_default && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Default:</span>{' '}
                            <code 
                              className="bg-muted px-1 py-0.5 rounded cursor-pointer hover:bg-muted-foreground hover:text-muted"
                              onClick={() => copyToClipboard(column.column_default || '')}
                            >
                              {column.column_default}
                            </code>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                        {column.is_nullable === 'YES' ? (
                          <span className="text-orange-600">Nullable</span>
                        ) : (
                          <span className="text-green-600">Required</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}