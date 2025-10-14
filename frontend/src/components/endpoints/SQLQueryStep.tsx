import { Code2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SQLQueryStepProps {
  sql: string;
  onSqlChange: (sql: string) => void;
}

export const SQLQueryStep = ({ sql, onSqlChange }: SQLQueryStepProps) => {
  const hasIdentifierPlaceholder = /\b(from|join|update|into|delete\s+from|truncate|alter\s+table|create\s+table)\s+\{[a-zA-Z_][a-zA-Z0-9_]*\}/i.test(sql);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">SQL Query</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Write the SQL that will execute when this endpoint is called. Use {`{param}`} syntax for dynamic values.
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="sql" className="text-sm font-medium mb-2 block">SQL Query *</Label>
        <Textarea 
          id="sql"
          placeholder="SELECT * FROM users WHERE id = {id};" 
          value={sql} 
          onChange={(e) => onSqlChange(e.target.value)} 
          className="min-h-[200px] font-mono text-sm resize-none"
        />
        <div className="mt-2 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="font-medium">Allowed:</span> SELECT, INSERT, UPDATE, DELETE on app tables
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-red-600" />
            <span className="font-medium">Blocked:</span> System tables, file operations, dangerous commands
          </p>
        </div>
      </div>

      {hasIdentifierPlaceholder && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <div className="font-semibold mb-1">Security Warning</div>
              Using parameters as table/column names is not supported for security reasons. Please use fixed identifiers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
