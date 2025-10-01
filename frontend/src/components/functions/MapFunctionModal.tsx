import { useState } from 'react';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle } from "lucide-react";
import type { FunctionData } from '@/services/functions';

interface MapFunctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  functionData: FunctionData | null;
}

export function MapFunctionModal({
  open,
  onOpenChange,
  functionData,
}: MapFunctionModalProps) {
  const [endpoint, setEndpoint] = useState('');

  const handleClose = () => {
    setEndpoint('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for future implementation
    alert('Endpoint mapping will be implemented in a future release');
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Function to API Endpoint
          </DialogTitle>
          <DialogDescription>
            Map "{functionData?.name}" to a REST API endpoint (Coming Soon)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This feature is under development and will be available in a future release.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint Path</Label>
              <Input
                id="endpoint"
                placeholder="/api/functions/my-function"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                The REST endpoint path where this function will be accessible
              </p>
            </div>

            <div className="space-y-2">
              <Label>Function Details</Label>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium">Name:</span>
                  <span className="font-mono">{functionData?.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Schema:</span>
                  <span className="font-mono">{functionData?.schema || 'public'}</span>
                </div>
                {functionData?.parameters && (
                  <div className="flex gap-2">
                    <span className="font-medium">Parameters:</span>
                    <span className="font-mono text-xs">{functionData.parameters}</span>
                  </div>
                )}
                {functionData?.return_type && (
                  <div className="flex gap-2">
                    <span className="font-medium">Returns:</span>
                    <span className="font-mono text-xs">{functionData.return_type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" disabled>
              Map Endpoint (Coming Soon)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
