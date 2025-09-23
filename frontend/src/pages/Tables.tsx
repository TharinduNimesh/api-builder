import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, Plus, Eye, Database, Map, Trash2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";

const Tables = () => {
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [createTableSQL, setCreateTableSQL] = useState(
    `CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`
  );

  const tables = [
    {
      name: "users",
      rows: 1250,
      columns: 5,
      created: "2 days ago",
      description: "User accounts and profiles"
    },
    {
      name: "posts",
      rows: 340,
      columns: 8,
      created: "1 week ago",
      description: "Blog posts and articles"
    },
    {
      name: "comments",
      rows: 2100,
      columns: 6,
      created: "1 week ago",
      description: "User comments on posts"
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tables</h1>
              <p className="text-muted-foreground">
                Manage your database tables and schemas
              </p>
            </div>
            
            <Dialog open={createTableOpen} onOpenChange={setCreateTableOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create table
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create table (SQL)</DialogTitle>
                  <DialogDescription>
                    Write the SQL statement to create your new table
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sql">SQL Statement</Label>
                    <Textarea
                      id="sql"
                      value={createTableSQL}
                      onChange={(e) => setCreateTableSQL(e.target.value)}
                      className="min-h-[200px] font-mono text-sm bg-code-background text-code-foreground mt-2"
                      style={{ fontFamily: 'Ubuntu Mono, monospace' }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateTableOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCreateTableOpen(false)}>
                    Create table
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <Card key={table.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <Table className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {table.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Rows</p>
                        <p className="text-lg font-semibold text-foreground">
                          {table.rows.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Columns</p>
                        <p className="text-lg font-semibold text-foreground">
                          {table.columns}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">
                        Created {table.created}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Rows
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Database className="h-4 w-4 mr-1" />
                          Columns
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button variant="default" size="sm" className="flex-1">
                          <Map className="h-4 w-4 mr-1" />
                          Map to API
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {tables.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Table className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No tables yet</h3>
                    <p className="text-muted-foreground">
                      Create your first database table to get started
                    </p>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first table
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tables;