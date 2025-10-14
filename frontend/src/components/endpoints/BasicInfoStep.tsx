import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HttpMethod } from './types';

interface BasicInfoStepProps {
  method: HttpMethod;
  path: string;
  description: string;
  onMethodChange: (method: HttpMethod) => void;
  onPathChange: (path: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const BasicInfoStep = ({
  method,
  path,
  description,
  onMethodChange,
  onPathChange,
  onDescriptionChange
}: BasicInfoStepProps) => {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Endpoint Basics</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define your API endpoint's HTTP method and URL path. Use {`{param}`} for dynamic path segments.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="method" className="text-sm font-medium mb-2 block">HTTP Method *</Label>
          <Select value={method} onValueChange={onMethodChange}>
            <SelectTrigger id="method" className="w-full h-12">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">
                <div className="flex items-center gap-3 py-1">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-3">GET</Badge>
                  <div className="text-left">
                    <div className="font-medium">GET Request</div>
                    <div className="text-xs text-slate-500">Retrieve data</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="POST">
                <div className="flex items-center gap-3 py-1">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-3">POST</Badge>
                  <div className="text-left">
                    <div className="font-medium">POST Request</div>
                    <div className="text-xs text-slate-500">Create or execute</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="PUT">
                <div className="flex items-center gap-3 py-1">
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs px-3">PUT</Badge>
                  <div className="text-left">
                    <div className="font-medium">PUT Request</div>
                    <div className="text-xs text-slate-500">Update data</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="DELETE">
                <div className="flex items-center gap-3 py-1">
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs px-3">DELETE</Badge>
                  <div className="text-left">
                    <div className="font-medium">DELETE Request</div>
                    <div className="text-xs text-slate-500">Remove data</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="path" className="text-sm font-medium mb-2 block">
            Endpoint Path *
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-mono text-sm font-medium">
              /api/b
            </span>
            <Input 
              id="path"
              placeholder="/users/{id}" 
              value={path} 
              onChange={(e) => onPathChange(e.target.value)}
              className="pl-[75px] h-12 font-mono text-base"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Example: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/users</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/posts/{`{id}`}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/sum/{`{a}`}/{`{b}`}</code>
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description (optional)</Label>
          <Input 
            id="description"
            placeholder="What does this endpoint do?" 
            value={description} 
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {path && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-blue-900 dark:text-blue-100">Preview: </span>
              <code className="text-blue-700 dark:text-blue-300 font-mono">{method} /api/b{path}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
