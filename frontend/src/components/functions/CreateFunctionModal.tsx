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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createFunction } from '@/services/functions';
import { notifySuccess, notifyError } from '@/lib/notify';

interface CreateFunctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateFunctionModal({ open, onOpenChange, onSuccess }: CreateFunctionModalProps) {
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sql.trim()) {
      notifyError('Please enter SQL statement');
      return;
    }

    setLoading(true);
    try {
      const result = await createFunction({ sql: sql.trim() });
      
      if (result.status === 'ok') {
        notifySuccess('Function created successfully');
        setSql('');
        onOpenChange(false);
        onSuccess?.();
      } else {
        notifyError('Failed to create function');
      }
    } catch (err: any) {
      console.error('Create function error:', err);
      notifyError(err?.message || 'Failed to create function');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSql('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Function</DialogTitle>
          <DialogDescription>
            Write your PostgreSQL function definition. Use CREATE FUNCTION or CREATE OR REPLACE FUNCTION.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sql">SQL Statement</Label>
              <Textarea
                id="sql"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder={`CREATE FUNCTION function_name(param1 type1, param2 type2)
RETURNS return_type AS $$
BEGIN
  -- Your function logic here
  RETURN result;
END;
$$ LANGUAGE plpgsql;`}
                className="font-mono text-sm min-h-[300px]"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Example: CREATE FUNCTION add_numbers(a integer, b integer) RETURNS integer AS $$ BEGIN RETURN a + b; END; $$ LANGUAGE plpgsql;
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Function
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
