import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Database, Map, Trash2, Clock, User } from 'lucide-react';

interface TableCardProps {
  table: {
    name: string;
    schema?: string;
    full_name?: string;
    columns?: any[];
    createdAt?: string;
    updatedAt?: string;
    createdById?: string;
    updatedById?: string;
  };
  onViewRows: () => void;
  onViewColumns: () => void;
  onMapAPI: () => void;
  onDelete: () => void;
}

export function TableCard({ table, onViewRows, onViewColumns, onMapAPI, onDelete }: TableCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const columnCount = table.columns?.length || 0;

  return (
    <Card className="transition-all hover:shadow-md border-border/40 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {table.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {table.schema || 'public'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {columnCount} {columnCount === 1 ? 'column' : 'columns'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Created: {formatDate(table.createdAt)}</span>
          </div>
          {table.updatedAt && table.updatedAt !== table.createdAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Updated: {formatDate(table.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewRows}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Rows
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewColumns}
            >
              <Database className="h-4 w-4 mr-1" />
              Columns
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="flex-1" onClick={onMapAPI}>
              <Map className="h-4 w-4 mr-1" />
              Map to API
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDelete}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}