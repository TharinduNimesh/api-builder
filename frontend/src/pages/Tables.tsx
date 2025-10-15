import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, RefreshCw, Table } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useTables, type TableData } from '@/hooks/useTables';

// Import our new components
import { 
  TableCard, 
  CreateTableModal, 
  ViewRowsModal, 
  ViewColumnsModal, 
  DeleteConfirmModal,
  MapTableCRUDModal
} from '@/components/tables';

const Tables = () => {
  // Use the custom hook for table management
  const { tables, loading, refreshing, fetchTables } = useTables();
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [rowsModalOpen, setRowsModalOpen] = useState(false);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapAPIModalOpen, setMapAPIModalOpen] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Action handlers
  const handleViewRows = (table: TableData) => {
    setSelectedTable(table);
    setRowsModalOpen(true);
  };

  const handleViewColumns = (table: TableData) => {
    setSelectedTable(table);
    setColumnsModalOpen(true);
  };

  const handleMapAPI = (table: TableData) => {
    setSelectedTable(table);
    setMapAPIModalOpen(true);
  };

  const handleDelete = (table: TableData) => {
    setSelectedTable(table);
    setDeleteModalOpen(true);
  };

  const handleTableCreated = () => {
    fetchTables(true);
  };

  const handleTableDeleted = () => {
    fetchTables(true);
  };

  const handleEndpointsCreated = () => {
    // Just close the modal, endpoints are created in API Designer
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tables</h1>
              <p className="text-muted-foreground">
                Manage your database tables and schemas
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => fetchTables(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Table
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading tables...</span>
            </div>
          )}

          {/* Tables Grid */}
          {!loading && tables.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <TableCard
                  key={table.full_name || table.name}
                  table={table}
                  onViewRows={() => handleViewRows(table)}
                  onViewColumns={() => handleViewColumns(table)}
                  onMapAPI={() => handleMapAPI(table)}
                  onDelete={() => handleDelete(table)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && tables.length === 0 && (
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
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first table
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateTableModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleTableCreated}
      />
      
      <ViewRowsModal
        open={rowsModalOpen}
        onOpenChange={setRowsModalOpen}
        table={selectedTable}
      />
      
      <ViewColumnsModal
        open={columnsModalOpen}
        onOpenChange={setColumnsModalOpen}
        table={selectedTable}
      />
      
      <MapTableCRUDModal
        open={mapAPIModalOpen}
        onOpenChange={setMapAPIModalOpen}
        table={selectedTable}
        onSuccess={handleEndpointsCreated}
      />
      
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        table={selectedTable}
        onSuccess={handleTableDeleted}
      />
    </div>
  );
};

export default Tables;