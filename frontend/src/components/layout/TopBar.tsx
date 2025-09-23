import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity } from "lucide-react";

interface TopBarProps {
  status?: "deploying" | "running" | "failed";
}

export function TopBar({ 
  status = "running"
}: TopBarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      case "deploying":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "failed":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-600 border-slate-500/30";
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Badge className={`${getStatusColor(status)} border font-medium`} variant="secondary">
            <Activity className="h-3 w-3 mr-1.5" />
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            API Playground
          </Button>
        </div>
      </div>
    </header>
  );
}