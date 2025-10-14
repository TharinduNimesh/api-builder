import { Shield, Lock, Users, Globe, CheckCircle2, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParamDef, HttpMethod } from './types';

interface AccessControlStepProps {
  isProtected: boolean;
  allowedRoles: string[];
  projectRoleNames: string[];
  method: HttpMethod;
  path: string;
  params: ParamDef[];
  onProtectedChange: (value: boolean) => void;
  onAllowedRolesChange: (roles: string[]) => void;
}

export const AccessControlStep = ({
  isProtected,
  allowedRoles,
  projectRoleNames,
  method,
  path,
  params,
  onProtectedChange,
  onAllowedRolesChange
}: AccessControlStepProps) => {
  const toggleRole = (role: string) => {
    const active = allowedRoles.includes(role);
    onAllowedRolesChange(active ? allowedRoles.filter(x => x !== role) : [...allowedRoles, role]);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Access Control</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure authentication and authorization for this endpoint.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">Protected Endpoint</Label>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Require Bearer token authentication for both System Users and Application Users
              </p>
            </div>
            <Switch 
              checked={isProtected} 
              onCheckedChange={onProtectedChange}
              className="mt-1"
            />
          </div>
        </div>

        {isProtected && (
          <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Allowed Application User Roles
              </Label>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Restrict access to specific roles. Leave empty to allow all authenticated users.
            </p>
            
            {projectRoleNames.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {projectRoleNames.map(r => {
                  const active = allowedRoles.includes(r);
                  return (
                    <Button
                      key={r}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className={`
                        transition-all
                        ${active 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                          : 'hover:border-purple-300 dark:hover:border-purple-600'
                        }
                      `}
                      onClick={() => toggleRole(r)}
                    >
                      {active && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      <Users className="h-3 w-3 mr-1" />
                      {r}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No roles configured in project. All authenticated users will have access.
                </p>
              </div>
            )}
            
            {allowedRoles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded p-3 mt-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Selected roles:</p>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {allowedRoles.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {!isProtected && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">Public endpoint:</span> No authentication required. Anyone can access this endpoint.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Preview */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Endpoint Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 w-24">Method:</span>
            <Badge className={`${
              method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              method === 'PUT' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>{method}</Badge>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">Path:</span>
            <code className="font-mono text-slate-900 dark:text-slate-100">/api/b{path}</code>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">Parameters:</span>
            <span className="text-slate-900 dark:text-slate-100">
              {params.length === 0 ? 'None' : `${params.length} (${params.filter(p => p.required).length} required)`}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">Access:</span>
            <span className="text-slate-900 dark:text-slate-100">
              {isProtected 
                ? `Protected ${allowedRoles.length > 0 ? `(${allowedRoles.length} role${allowedRoles.length > 1 ? 's' : ''})` : '(all authenticated)'}` 
                : 'Public'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
