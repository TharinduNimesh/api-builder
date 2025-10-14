import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteParamDialogProps {
  open: boolean;
  paramName: string;
  usedIn: string[];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteParamDialog({
  open,
  paramName,
  usedIn,
  onOpenChange,
  onConfirm,
}: DeleteParamDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertDialogTitle>Delete Parameter?</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="pt-3 space-y-2">
            <p>
              You are about to delete parameter{" "}
              <code className="font-mono font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {paramName}
              </code>
            </p>
            {usedIn.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                  ⚠️ Warning
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This parameter is referenced in:{" "}
                  <span className="font-semibold">
                    {usedIn.join(" and ")}
                  </span>
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Deleting it may cause the endpoint to fail.
                </p>
              </div>
            )}
            <p className="text-sm">
              Are you sure you want to continue?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Parameter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
