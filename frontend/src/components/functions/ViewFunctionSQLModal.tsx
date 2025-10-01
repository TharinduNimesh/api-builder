import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check } from 'lucide-react';
import { getFunctionDefinition } from '@/services/functions';
import type { FunctionData } from '@/services/functions';
import { notifySuccess, notifyError } from '@/lib/notify';

interface ViewFunctionSQLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  functionData: FunctionData | null;
}

export function ViewFunctionSQLModal({ open, onOpenChange, functionData }: ViewFunctionSQLModalProps) {
  const [definition, setDefinition] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && functionData) {
      // If we already have definition in the function data, use it
      if (functionData.definition) {
        setDefinition(functionData.definition);
      } else {
        // Otherwise fetch it
        fetchDefinition();
      }
    }
  }, [open, functionData]);

  const fetchDefinition = async () => {
    if (!functionData) return;
    
    setLoading(true);
    try {
      const result = await getFunctionDefinition(
        functionData.schema || 'public',
        functionData.name
      );
      
      if (result && result.definition) {
        setDefinition(result.definition);
      } else {
        setDefinition('-- Definition not available');
      }
    } catch (err: any) {
      console.error('Failed to fetch definition:', err);
      notifyError(err?.message || 'Failed to load function definition');
      setDefinition('-- Error loading definition');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(definition);
      setCopied(true);
      notifySuccess('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notifyError('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">
            {functionData?.schema || 'public'}.{functionData?.name}
          </DialogTitle>
          <DialogDescription>
            Function definition and SQL code
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading definition...</span>
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[500px] border">
                {definition || '-- No definition available'}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {functionData?.parameters && (
          <div className="bg-muted p-3 rounded-md text-xs border-t">
            <p className="font-semibold mb-1">Parameters:</p>
            <code className="text-xs">{functionData.parameters}</code>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
