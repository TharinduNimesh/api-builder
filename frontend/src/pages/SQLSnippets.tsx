import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, Save, BookMarked, FileText, Clock, Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { 
  getAllSnippets, 
  saveSnippet, 
  updateSnippet, 
  deleteSnippet as deleteSnippetAPI,
  type SqlSnippet 
} from "@/services/sql";
import { notifySuccess, notifyError } from "@/lib/notify";

const SQLSnippets = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<SqlSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<SqlSnippet | null>(null);
  const [snippetName, setSnippetName] = useState("");
  const [snippetDescription, setSnippetDescription] = useState("");
  const [snippetQuery, setSnippetQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSnippets();
  }, [page]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const response = await getAllSnippets(page, pageSize);
      setSnippets(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSnippet(null);
    setSnippetName("");
    setSnippetDescription("");
    setSnippetQuery("");
    setModalOpen(true);
  };

  const openEditModal = (snippet: SqlSnippet) => {
    setEditingSnippet(snippet);
    setSnippetName(snippet.name);
    setSnippetDescription(snippet.description || "");
    setSnippetQuery(snippet.query);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!snippetName.trim()) {
      notifyError('Please enter a snippet name');
      return;
    }
    if (!snippetQuery.trim()) {
      notifyError('Please enter SQL query');
      return;
    }

    setSaving(true);
    try {
      if (editingSnippet) {
        await updateSnippet(editingSnippet.id, snippetName, snippetQuery, snippetDescription);
        notifySuccess('Snippet updated successfully');
      } else {
        await saveSnippet(snippetName, snippetQuery, snippetDescription);
        notifySuccess('Snippet created successfully');
      }
      setModalOpen(false);
      loadSnippets();
    } catch (err: any) {
      notifyError(err?.message || 'Failed to save snippet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      await deleteSnippetAPI(id);
      notifySuccess('Snippet deleted successfully');
      loadSnippets();
    } catch (err: any) {
      notifyError(err?.message || 'Failed to delete snippet');
    }
  };

  const loadSnippetToEditor = (query: string) => {
    // Store in localStorage to pass to editor
    localStorage.setItem('sqlEditorQuery', query);
    navigate('/sql');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Filter snippets based on search query
  const filteredSnippets = snippets.filter(snippet => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      snippet.name.toLowerCase().includes(query) ||
      (snippet.description && snippet.description.toLowerCase().includes(query)) ||
      snippet.query.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/sql')}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">SQL Snippets</h1>
                <p className="text-muted-foreground">
                  Manage your saved SQL queries
                </p>
              </div>
            </div>
            <Button 
              onClick={openCreateModal}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Snippet
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Snippets</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <BookMarked className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Saved queries
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">This Page</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{snippets.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Currently showing
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Activity</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{snippets.length > 0 ? formatTimestamp(snippets[0].createdAt) : '-'}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Latest snippet
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search snippets by name, description, or query..." 
                  className="pl-10 border-slate-300 dark:border-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Snippets Grid */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : filteredSnippets.length === 0 ? (
              <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mx-auto mb-4">
                    <BookMarked className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {searchQuery ? 'No snippets match your search' : 'No snippets found'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search term' : 'Create your first snippet to reuse queries easily'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={openCreateModal}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Snippet
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSnippets.map((snippet) => (
                  <Card 
                    key={snippet.id} 
                    className="border border-slate-200 dark:border-slate-700 shadow-sm hover:border-orange-200 dark:hover:border-orange-800 transition-colors group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle 
                            className="text-lg cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate" 
                            onClick={() => loadSnippetToEditor(snippet.query)}
                          >
                            {snippet.name}
                          </CardTitle>
                          {snippet.description && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {snippet.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditModal(snippet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => handleDelete(snippet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32 mb-3">
                        <code 
                          className="text-xs font-mono block whitespace-pre-wrap cursor-pointer text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          onClick={() => loadSnippetToEditor(snippet.query)}
                        >
                          {snippet.query}
                        </code>
                      </ScrollArea>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(snippet.createdAt)}
                        </span>
                        {snippet.updatedAt !== snippet.createdAt && (
                          <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                            Updated
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} • Showing {filteredSnippets.length} of {total} snippets{searchQuery && ` (filtered)`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingSnippet ? 'Edit' : 'Create'} SQL Snippet</DialogTitle>
            <DialogDescription>
              {editingSnippet ? 'Update your saved query' : 'Save a query for later use'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <Input
                id="name"
                placeholder="My useful query"
                value={snippetName}
                onChange={(e) => setSnippetName(e.target.value)}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this query do?"
                value={snippetDescription}
                onChange={(e) => setSnippetDescription(e.target.value)}
                rows={2}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="query" className="text-sm font-medium">SQL Query *</Label>
              <Textarea
                id="query"
                placeholder="SELECT * FROM users WHERE ..."
                value={snippetQuery}
                onChange={(e) => setSnippetQuery(e.target.value)}
                rows={10}
                className="font-mono text-sm border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              className="border-slate-300 dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingSnippet ? 'Update' : 'Create'} Snippet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SQLSnippets;
