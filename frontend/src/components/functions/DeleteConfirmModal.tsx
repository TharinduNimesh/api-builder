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
import { Loader2, Trash2 } from 'lucide-react';
import { deleteFunction } from '@/services/functions';
import type { FunctionData } from '@/services/functions';
import { notifySuccess, notifyError } from '@/lib/notify';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  functionData: FunctionData | null;
  onSuccess?: () => void;
}

export function DeleteConfirmModal({ open, onOpenChange, functionData, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!functionData) {
      notifyError('No function selected');
      return;
    }

    setLoading(true);
    try {
      const result = await deleteFunction(
        functionData.schema || 'public',
        functionData.name
      );
      
      if (result.status === 'ok') {
        notifySuccess('Function deleted successfully');
        onOpenChange(false);
        onSuccess?.();
      } else {
        notifyError('Failed to delete function');
      }
    } catch (err: any) {
      console.error('Delete function error:', err);
      notifyError(err?.message || 'Failed to delete function');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Function
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this function? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm font-semibold mb-2">Function to delete:</p>
          <code className="text-sm font-mono block bg-background p-2 rounded border">
            {functionData?.schema || 'public'}.{functionData?.name}
          </code>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Function
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
