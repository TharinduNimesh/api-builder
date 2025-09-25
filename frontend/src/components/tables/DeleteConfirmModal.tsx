import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { deleteTable } from '@/services/tables';
import { notifySuccess, notifyError } from '@/lib/notify';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: {
    name: string;
    schema?: string;
    full_name?: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteConfirmModal({ open, onOpenChange, table, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const handleClose = () => {
    if (!loading) {
      setConfirmName('');
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!table || confirmName !== table.name) return;
    
    setLoading(true);
    try {
      const schema = table.schema || 'public';
      await deleteTable(schema, table.name);
      notifySuccess(`Table "${table.name}" has been deleted successfully`);
      handleClose();
      onSuccess();
    } catch (err) {
      notifyError('Failed to delete table. It may have foreign key constraints.');
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmName === table?.name;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Table
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the table and all its data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">Warning</p>
                  <p className="text-muted-foreground">
                    You are about to delete the table{' '}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      {table?.full_name || table?.name}
                    </code>
                    . This will remove all data and cannot be recovered.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm font-medium">
              Type <code className="bg-muted px-1 py-0.5 rounded font-mono">{table?.name}</code> to confirm:
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Enter table name"
              className={confirmName && !isConfirmValid ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
              autoComplete="off"
            />
            {confirmName && !isConfirmValid && (
              <p className="text-xs text-destructive">Table name doesn't match</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || loading}
            className="min-w-24"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Table
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}