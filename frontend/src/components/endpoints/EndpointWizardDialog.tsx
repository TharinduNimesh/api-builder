import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Globe, Variable, Shield, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import * as endpointService from '@/services/endpoints';
import type { EndpointData } from '@/services/endpoints';
import { WizardStepper } from './WizardStepper';
import { BasicInfoStep } from './BasicInfoStep';
import { SQLQueryStep } from './SQLQueryStep';
import { ParametersStep } from './ParametersStep';
import { AccessControlStep } from './AccessControlStep';
import { DeleteParamDialog } from './DeleteParamDialog';
import { HttpMethod, ParamDef, EndpointFormData } from './types';

interface EndpointWizardDialogProps {
  open: boolean;
  projectRoleNames: string[];
  editEndpoint?: EndpointData | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EndpointWizardDialog = ({
  open,
  projectRoleNames,
  editEndpoint,
  onOpenChange,
  onSuccess
}: EndpointWizardDialogProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [sql, setSql] = useState<string>('');
  const [params, setParams] = useState<ParamDef[]>([]);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paramToDelete, setParamToDelete] = useState<string | null>(null);

  const steps = [
    { num: 1, label: 'Basic Info', icon: Globe },
    { num: 2, label: 'SQL Query', icon: Code2 },
    { num: 3, label: 'Parameters', icon: Variable },
    { num: 4, label: 'Access', icon: Shield }
  ];

  // Auto-detect parameters from path and SQL
  const detectedParams = useMemo(() => {
    const pathParams: string[] = [];
    const sqlParams: string[] = [];
    
    const pathRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = pathRe.exec(path)) !== null) {
      if (!pathParams.includes(m[1])) pathParams.push(m[1]);
    }
    
    const sqlRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    while ((m = sqlRe.exec(sql)) !== null) {
      if (!sqlParams.includes(m[1])) sqlParams.push(m[1]);
    }
    
    return { pathParams, sqlParams };
  }, [path, sql]);

  // Merge detected params with user overrides
  useEffect(() => {
    const { pathParams, sqlParams } = detectedParams;
    const allNames = Array.from(new Set([...pathParams, ...sqlParams]));
    
    setParams(prev => {
      const updated: ParamDef[] = [];
      const existingMap: Record<string, ParamDef> = {};
      prev.forEach(p => existingMap[p.name] = p);
      
      allNames.forEach(name => {
        if (existingMap[name]) {
          updated.push(existingMap[name]);
        } else {
          const isPath = pathParams.includes(name);
          updated.push({
            name,
            in: isPath ? 'path' : 'query',
            type: 'string',
            required: isPath
          });
        }
      });
      
      return updated;
    });
  }, [detectedParams]);

  const canProceedToStep = (step: number): boolean => {
    switch(step) {
      case 2:
        return path.trim().length > 0 && path.startsWith('/');
      case 3:
        return sql.trim().length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedToStep(currentStep + 1)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      if (currentStep === 1) toast.error('Please enter a valid path starting with /');
      if (currentStep === 2) toast.error('Please enter SQL query');
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const resetForm = () => {
    setCurrentStep(1);
    setMethod('GET');
    setPath('');
    setDescription('');
    setSql('');
    setParams([]);
    setIsProtected(false);
    setAllowedRoles([]);
  };

  // Initialize form with edit data
  useEffect(() => {
    if (open && editEndpoint) {
      setMethod(editEndpoint.method as HttpMethod);
      setPath(editEndpoint.path);
      setDescription(editEndpoint.description || '');
      setSql(editEndpoint.sql);
      // Initialize params if endpoint carries them, otherwise params will be auto-detected
      const incomingParams = (editEndpoint as any).params as any[] | undefined;
      if (Array.isArray(incomingParams)) {
        setParams(incomingParams.map(p => ({
          name: p.name,
          in: p.in,
          type: p.type || 'string',
          required: !!p.required,
        })));
      }
      // Use is_protected field instead of is_active
      const isProtectedValue = (editEndpoint as any).is_protected;
      setIsProtected(!!isProtectedValue);
      // Pre-select allowed roles when editing
      const incomingRoles = (editEndpoint as any).allowed_roles as string[] | undefined;
      setAllowedRoles(Array.isArray(incomingRoles) ? incomingRoles : []);
      setCurrentStep(1);
    } else if (open && !editEndpoint) {
      resetForm();
    }
  }, [open, editEndpoint]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      // Basic client-side guard for identifier placeholders
      const identifierCtxRe = /(from|join|update|into|delete\s+from|truncate|alter\s+table|create\s+table)\s+\{[a-zA-Z_][a-zA-Z0-9_]*\}/i;
      if (identifierCtxRe.test(sql)) {
        toast.error('Using parameters as table/column names is not supported. Please use fixed identifiers.');
        return;
      }

      // Prepare the payload with proper handling for all edge cases
      const payload = {
        method,
        path,
        description: description.trim() || null,
        sql,
        is_active: true, // Always active when saving
        params: params.length > 0 ? params : undefined,
        is_protected: isProtected,
        // Only send allowed_roles if protected, otherwise explicitly null to clear old roles
        allowed_roles: isProtected ? (allowedRoles.length > 0 ? allowedRoles : undefined) : undefined,
      };

      if (editEndpoint) {
        // Update existing endpoint
        await endpointService.updateEndpoint(editEndpoint.id, payload);
        toast.success('Endpoint updated successfully');
      } else {
        // Create new endpoint
        await endpointService.createEndpoint(payload);
        toast.success('Endpoint created successfully');
      }
      
      handleClose();
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message || `Failed to ${editEndpoint ? 'update' : 'create'} endpoint`);
    }
  };

  const updateParam = (name: string, updates: Partial<ParamDef>) => {
    setParams(prev => prev.map(p => p.name === name ? { ...p, ...updates } : p));
  };

  const deleteParam = (name: string) => {
    const usedInPath = detectedParams.pathParams.includes(name);
    const usedInSql = detectedParams.sqlParams.includes(name);
    
    if (usedInPath || usedInSql) {
      setParamToDelete(name);
      setDeleteDialogOpen(true);
    } else {
      // No warning needed, delete immediately
      setParams(prev => prev.filter(p => p.name !== name));
      toast.success(`Parameter "${name}" deleted`);
    }
  };

  const confirmDeleteParam = () => {
    if (paramToDelete) {
      setParams(prev => prev.filter(p => p.name !== paramToDelete));
      toast.success(`Parameter "${paramToDelete}" deleted`);
      setParamToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getUsedIn = (paramName: string): string[] => {
    const usedIn: string[] = [];
    if (detectedParams.pathParams.includes(paramName)) usedIn.push('path');
    if (detectedParams.sqlParams.includes(paramName)) usedIn.push('SQL query');
    return usedIn;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Code2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span>{editEndpoint ? 'Edit API Endpoint' : 'Create API Endpoint'}</span>
          </DialogTitle>
          <DialogDescription>
            {editEndpoint ? 'Update your endpoint configuration' : 'Build a dynamic REST endpoint in 4 easy steps'}
          </DialogDescription>
        </DialogHeader>

        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          canProceedToStep={canProceedToStep}
        />

        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          {/* Missing Parameters Warning */}
          {(() => {
            const allDetected = [...detectedParams.pathParams, ...detectedParams.sqlParams];
            const uniqueDetected = Array.from(new Set(allDetected));
            const missingParams = uniqueDetected.filter(
              name => !params.some(p => p.name === name)
            );
            return missingParams.length > 0 ? (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Missing Parameters Detected
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      The following parameters are referenced in your path or SQL but have been removed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingParams.map(name => (
                        <code key={name} className="text-xs font-mono font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 px-2 py-1 rounded">
                          {name}
                        </code>
                      ))}
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                      This endpoint may not work as expected. Consider adding these parameters back.
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {currentStep === 1 && (
            <BasicInfoStep
              method={method}
              path={path}
              description={description}
              onMethodChange={setMethod}
              onPathChange={setPath}
              onDescriptionChange={setDescription}
            />
          )}

          {currentStep === 2 && (
            <SQLQueryStep
              sql={sql}
              onSqlChange={setSql}
            />
          )}

          {currentStep === 3 && (
            <ParametersStep
              params={params}
              pathParams={detectedParams.pathParams}
              sqlParams={detectedParams.sqlParams}
              onParamUpdate={updateParam}
              onParamDelete={deleteParam}
            />
          )}

          {currentStep === 4 && (
            <AccessControlStep
              isProtected={isProtected}
              allowedRoles={allowedRoles}
              projectRoleNames={projectRoleNames}
              method={method}
              path={path}
              params={params}
              onProtectedChange={setIsProtected}
              onAllowedRolesChange={setAllowedRoles}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <Button
            variant="outline"
            onClick={() => currentStep === 1 ? handleClose() : prevStep()}
            className="gap-2"
          >
            {currentStep === 1 ? (
              <>
                <Clock className="h-4 w-4" />
                Cancel
              </>
            ) : (
              '← Back'
            )}
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToStep(currentStep + 1)}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2 min-w-[120px]"
              >
                Next Step →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!path || !sql}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[140px]"
              >
                <CheckCircle2 className="h-4 w-4" />
                {editEndpoint ? 'Update Endpoint' : 'Create Endpoint'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Parameter Confirmation Dialog */}
      <DeleteParamDialog
        open={deleteDialogOpen}
        paramName={paramToDelete || ''}
        usedIn={paramToDelete ? getUsedIn(paramToDelete) : []}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteParam}
      />
    </Dialog>
  );
};
