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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { runSql } from '@/services/sql';
import { notifySuccess, notifyError } from '@/lib/notify';

interface CreateTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTableModal({ open, onOpenChange, onSuccess }: CreateTableModalProps) {
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (!loading) {
      setSql('');
      setWarnMessage(null);
      onOpenChange(false);
    }
  };

  const handleCreate = async () => {
    if (!sql.trim()) return;
    
    setLoading(true);
    setWarnMessage(null);
    try {
      const result = await runSql(sql.trim());
      
      if (result?.warnReplace) {
        setWarnMessage(result.warnReplace);
      } else {
        notifySuccess('Table created successfully');
        handleClose();
        onSuccess();
      }
    } catch (err: any) {
      notifyError(err?.message || 'Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const exampleSql = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const isValidSql = sql.trim().toLowerCase().startsWith('create table') || 
                    sql.trim().toLowerCase().startsWith('create or replace table');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-6 w-6" />
            Create New Table
          </DialogTitle>
          <DialogDescription className="text-base">
            Write a CREATE TABLE statement to define your new table structure
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel - SQL Editor */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Warning Message */}
            {warnMessage && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">Warning</p>
                      <p className="text-amber-800">{warnMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SQL Input */}
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sql" className="text-base font-semibold">
                  SQL Statement
                </Label>
                <div className="flex items-center gap-2">
                  {sql.trim() && (
                    <Badge variant={isValidSql ? "default" : "destructive"} className="text-xs">
                      {isValidSql ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valid SQL
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Invalid SQL
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
              <div className='p-1'>
              <Textarea
                id="sql"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder="Type your CREATE TABLE statement here..."
                className="flex-1 font-mono text-sm resize-none border border-muted rounded-md bg-card p-3 focus-visible:outline-none focus-visible:border-primary"
                disabled={loading}
                style={{ minHeight: '300px' }}
              />
              </div>
            </div>
          </div>

          {/* Right Panel - Guidelines & Example */}
          <div className="w-80 flex flex-col space-y-4 overflow-auto">
            {/* Guidelines */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-blue-900 text-sm">Guidelines</h4>
                </div>
                <ul className="text-blue-800 space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Only CREATE TABLE and CREATE OR REPLACE TABLE statements are allowed
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Table names cannot start with 'sys' or 'Sys'
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Cannot reference system tables (Sys*) in column definitions
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Use schema prefix or it defaults to 'public' schema
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Example */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Example</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSql(exampleSql)}
                    className="h-7 text-xs"
                    disabled={loading}
                  >
                    Use Example
                  </Button>
                </div>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap bg-muted/30 p-3 rounded border overflow-x-auto">
                  {exampleSql}
                </pre>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Quick Templates</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setSql(`CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`)}
                    disabled={loading}
                  >
                    Users Table
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setSql(`CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`)}
                    disabled={loading}
                  >
                    Products Table
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setSql(`CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`)}
                    disabled={loading}
                  >
                    Orders Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!sql.trim() || !isValidSql || loading}
            className="min-w-36"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Table
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}