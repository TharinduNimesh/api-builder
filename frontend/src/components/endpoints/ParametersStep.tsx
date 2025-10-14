import { Variable, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ParamDef } from './types';

interface ParametersStepProps {
  params: ParamDef[];
  pathParams: string[];
  sqlParams: string[];
  onParamUpdate: (name: string, updates: Partial<ParamDef>) => void;
  onParamDelete?: (name: string) => void;
}

export const ParametersStep = ({ params, pathParams, sqlParams, onParamUpdate, onParamDelete }: ParametersStepProps) => {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Variable className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Parameters Configuration
              {params.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {params.length} detected
                </Badge>
              )}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure how each parameter should be received and validated.
            </p>
          </div>
        </div>
      </div>

      {params.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Variable className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">No parameters detected</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Add {`{paramName}`} to your path or SQL query to create dynamic parameters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {params.map((param, idx) => (
            <div 
              key={param.name} 
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
                      {param.name}
                    </code>
                    {pathParams.includes(param.name) && (
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                        Path param
                      </Badge>
                    )}
                    {sqlParams.includes(param.name) && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                        SQL param
                      </Badge>
                    )}
                  </div>
                </div>
                {onParamDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => onParamDelete(param.name)}
                    title={`Delete parameter ${param.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">Parameter Source</Label>
                  <Select 
                    value={param.in} 
                    onValueChange={(v) => onParamUpdate(param.name, { in: v as any })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="path">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Path</span>
                          <span className="text-xs text-slate-500">/{`{id}`}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="query">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Query String</span>
                          <span className="text-xs text-slate-500">?id=123</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="body">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Request Body</span>
                          <span className="text-xs text-slate-500">JSON</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">Data Type</Label>
                  <Select 
                    value={param.type} 
                    onValueChange={(v) => onParamUpdate(param.name, { type: v as any })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2 h-9">
                    <Switch 
                      id={`required-${param.name}`}
                      checked={param.required}
                      onCheckedChange={(checked) => onParamUpdate(param.name, { required: checked })}
                    />
                    <Label htmlFor={`required-${param.name}`} className="text-sm font-medium cursor-pointer">
                      Required
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
