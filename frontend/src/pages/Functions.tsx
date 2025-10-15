import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Zap, 
  Plus, 
  Search, 
  Code, 
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  MapPin,
  Play,
  Settings
} from "lucide-react";
import { useFunctions } from '@/hooks/useFunctions';
import type { FunctionData } from '@/services/functions';
import {
  CreateFunctionModal,
  MapFunctionModal,
  DeleteConfirmModal,
  ViewFunctionSQLModal
} from '@/components/functions';
import { RunFunctionModal } from '@/components/functions';

const Functions = () => {
  const { functions, loading, refreshing, error, fetchFunctions } = useFunctions();
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<FunctionData | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Initial fetch
  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  // Filtered functions
  const filteredFunctions = useMemo(() => {
    let filtered = functions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (fn) =>
          fn.name.toLowerCase().includes(query) ||
          fn.schema?.toLowerCase().includes(query) ||
          fn.parameters?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [functions, searchQuery]);

  // Action handlers
  const handleViewSQL = (func: FunctionData) => {
    setSelectedFunction(func);
    setSqlModalOpen(true);
  };

  const handleMap = (func: FunctionData) => {
    setSelectedFunction(func);
    setMapModalOpen(true);
  };

  const handleRun = (func: FunctionData) => {
    setSelectedFunction(func);
    setRunModalOpen(true);
  };

  const handleDelete = (func: FunctionData) => {
    setSelectedFunction(func);
    setDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    fetchFunctions(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Functions</h1>
              <p className="text-muted-foreground mt-1">
                Manage PostgreSQL functions in your database
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => fetchFunctions(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Function
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search functions by name, schema, or parameters..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading functions...</span>
            </div>
          )}

          {/* Functions Grid */}
          {!loading && filteredFunctions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFunctions.map((func, index) => (
                <Card key={func.id || index} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold font-mono truncate">
                            {func.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {func.schema || 'public'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSQL(func)}
                          title="View SQL"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMap(func)}
                          title="Map to endpoint"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(func)}
                          title="Delete function"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {func.parameters && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">Parameters:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                            {func.parameters}
                          </code>
                        </div>
                      )}
                      {func.return_type && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">Returns:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {func.return_type}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSQL(func)}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        View SQL
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRun(func)}
                        className="ml-auto"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Function
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State - No Functions */}
          {!loading && functions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No functions yet</h3>
                    <p className="text-muted-foreground">
                      Create your first PostgreSQL function to get started
                    </p>
                  </div>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first function
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State - No Search Results */}
          {!loading && functions.length > 0 && filteredFunctions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No functions found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                  >
                    Clear search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateFunctionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleSuccess}
      />
      
      <MapFunctionModal
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        functionData={selectedFunction}
        onSuccess={handleSuccess}
      />
      
      <RunFunctionModal
        open={runModalOpen}
        onOpenChange={setRunModalOpen}
        functionData={selectedFunction}
      />
      
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        functionData={selectedFunction}
        onSuccess={handleSuccess}
      />
      
      <ViewFunctionSQLModal
        open={sqlModalOpen}
        onOpenChange={setSqlModalOpen}
        functionData={selectedFunction}
      />
    </div>
  );
};

export default Functions;
