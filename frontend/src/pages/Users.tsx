import { useState, useMemo } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import * as usersService from '@/services/users';
import * as appUsersService from '@/services/appUsers';
import type { AppUserPayload } from '@/services/appUsers';
import * as projectService from '@/services/project';
import { useEffect } from 'react';
import { 
  UserHeader, 
  UserStats, 
  UserFilters, 
  UserCard, 
  UserEmptyState 
} from "@/components/users";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  createdAt: string;
  lastLogin: string;
  role: string;
  isProjectOwner: boolean;
}

const Users = () => {
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get current user to identify project owner (memoized to avoid identity churn)
  const currentUser = useMemo(() => getUser(), []);
  const [isOwner, setIsOwner] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [appUsers, setAppUsers] = useState<AppUserPayload[]>([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // App user action confirmation dialog
  const [appUserActionDialog, setAppUserActionDialog] = useState({ 
    open: false, 
    userId: '', 
    userName: '',
    action: 'ban' as 'ban' | 'activate',
    currentStatus: false
  });

  // Check if current user is project owner based on project.createdById
  const isCurrentUserProjectOwner = isOwner;

  // fetch project and determine ownership
  useEffect(() => {
    let mounted = true;
    async function loadProject() {
      try {
        const p = await projectService.getProject();
        if (!mounted) return;
        setProject(p || null);
        setIsOwner(!!(p && p.createdById && currentUser && p.createdById === currentUser.id));
      } catch (e) {
        // ignore, project may not exist
        if (mounted) setIsOwner(false);
      }
    }
    loadProject();
    return () => { mounted = false; };
  }, [currentUser?.id]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Status filter
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "active" && user.is_active) ||
                           (filterStatus === "inactive" && !user.is_active);
      
      // Search filter
      const matchesSearch = searchQuery === "" ||
                           user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [users, filterStatus, searchQuery]);

  // fetch users from backend when filter/search change
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await usersService.listUsers(filterStatus as any);
        if (!mounted) return;
        // annotate owner flag for sys users
        const annotated = (list as any[]).map(u => ({ ...u, isProjectOwner: !!(project && project.createdById === u.id) }));
        setUsers(annotated as any);
        // fetch app users for the project
        const appList = await appUsersService.listAppUsers(filterStatus as any);
        if (!mounted) return;
        setAppUsers(appList as any);
      } catch (err: any) {
        setError(err?.message || 'Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [filterStatus, searchQuery, project]);

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, is_active: !currentStatus } : user
    ));
    
    const action = currentStatus ? "banned" : "activated";
    toast.success(`User ${action} successfully`);
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;
    
    // Mock invite logic - replace with actual API call
    const newUser: User = {
      id: Date.now().toString(),
      first_name: inviteEmail.split('@')[0],
      last_name: "User",
      email: inviteEmail,
      is_active: false,
      createdAt: new Date().toISOString(),
      lastLogin: "Never",
      role: "user",
      isProjectOwner: false
    };
    
    setUsers(prev => [...prev, newUser]);
    setInviteEmail("");
    setInviteUserOpen(false);
    toast.success("Invitation sent successfully");
  };

  const handleToggleUserStatusLocal = async (userId: string, currentStatus: boolean) => {
    // optimistic update
    const previous = users.slice();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    try {
      await usersService.setUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'banned'} successfully`);
    } catch (err: any) {
      setUsers(previous);
      toast.error(err?.message || 'Failed to update user');
    }
  };

  const handleToggleAppUserStatus = (userId: string, userName: string, currentStatus: boolean) => {
    setAppUserActionDialog({
      open: true,
      userId,
      userName,
      action: currentStatus ? 'ban' : 'activate',
      currentStatus
    });
  };

  const confirmAppUserAction = async () => {
    const { userId, currentStatus } = appUserActionDialog;
    // optimistic update
    const previous = appUsers.slice();
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, status: currentStatus ? 'inactive' : 'active' } : u));
    setAppUserActionDialog({ open: false, userId: '', userName: '', action: 'ban', currentStatus: false });
    
    try {
      await appUsersService.setAppUserStatus(userId, !currentStatus);
      toast.success(`App user ${!currentStatus ? 'activated' : 'banned'} successfully`);
    } catch (err: any) {
      setAppUsers(previous);
      toast.error(err?.message || 'Failed to update app user');
    }
  };

  // Stats calculations
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    appUsers: appUsers.length
  };

  // --- Simple skeleton elements for loading states (kept local for quick iteration) ---
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );

  const HeaderSkeleton = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-10 w-36 rounded" />
      </div>
    </div>
  );

  const FiltersSkeleton = () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-40" />
    </div>
  );

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded">
          <Skeleton className="h-6 w-28 mb-3" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );

  const ListItemSkeleton = () => (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-56 mb-2" />
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <div className="w-32">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
  // --- end skeletons ---

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <TopBar />
      
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          {loading ? <HeaderSkeleton /> : (
            <UserHeader
              isCurrentUserProjectOwner={isCurrentUserProjectOwner}
              inviteUserOpen={inviteUserOpen}
              inviteEmail={inviteEmail}
              onInviteUserOpenChange={setInviteUserOpen}
              onInviteEmailChange={setInviteEmail}
              onInviteUser={handleInviteUser}
            />
          )}

          {/* Filters and Search */}
          {loading ? <FiltersSkeleton /> : (
            <UserFilters
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* User Stats */}
          {loading ? <StatsSkeleton /> : <UserStats users={users} appUsersCount={appUsers.length} />}

          {/* System Users Section */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">System Users</h2>
            <p className="text-sm text-muted-foreground">Internal users with access to the API builder platform</p>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 text-sm text-red-600">{error}</div>
            )}

            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && !error && filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={{ ...user, role: (user as any).role || 'user', isProjectOwner: (user as any).isProjectOwner || false }}
                isCurrentUserProjectOwner={isCurrentUserProjectOwner}
                onToggleUserStatus={handleToggleUserStatusLocal}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-50/50 dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400">
                External Application Users
              </span>
            </div>
          </div>

          {/* App Users List (separate) */}
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Application Users</h2>
              <p className="text-sm text-muted-foreground">Users who signed up from your application via public API</p>
            </div>
            
            <div className="space-y-4">
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <ListItemSkeleton key={i} />
                  ))}
                </div>
              )}

              {!loading && appUsers.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400">No application users yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Users will appear here when they sign up via your application
                  </p>
                </div>
              )}

              {!loading && appUsers.map((u) => (
                <div 
                  key={u.id} 
                  className="group p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-sm bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {u.firstName || u.email.split('@')[0]} {u.lastName || ''}
                          </h3>
                          {/* Status Badge */}
                          {u.status === 'active' ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                              Inactive
                            </span>
                          )}
                          {/* Role Badge */}
                          {u.roles && Array.isArray(u.roles) && u.roles.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              {u.roles.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isCurrentUserProjectOwner && (
                        <button 
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            u.status === 'active' 
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md' 
                              : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                          }`}
                          onClick={() => handleToggleAppUserStatus(u.id, `${u.firstName || u.email.split('@')[0]} ${u.lastName || ''}`.trim(), u.status === 'active')}
                        >
                          {u.status === 'active' ? 'Ban User' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State (only show when not loading and no error) */}
          {!loading && !error && filteredUsers.length === 0 && (
            <UserEmptyState
              filterStatus={filterStatus}
              isCurrentUserProjectOwner={isCurrentUserProjectOwner}
              onInviteUser={() => setInviteUserOpen(true)}
            />
          )}
        </div>
      </main>

      {/* App User Action Confirmation Dialog */}
      <Dialog open={appUserActionDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAppUserActionDialog({ open: false, userId: '', userName: '', action: 'ban', currentStatus: false });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {appUserActionDialog.action === 'ban' ? 'Ban User' : 'Activate User'}
            </DialogTitle>
            <DialogDescription>
              {appUserActionDialog.action === 'ban' 
                ? `Are you sure you want to ban "${appUserActionDialog.userName}"? They will no longer be able to access the application.`
                : `Are you sure you want to activate "${appUserActionDialog.userName}"? They will regain access to the application.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAppUserActionDialog({ open: false, userId: '', userName: '', action: 'ban', currentStatus: false })}
            >
              Cancel
            </Button>
            <Button
              variant={appUserActionDialog.action === 'ban' ? 'destructive' : 'default'}
              onClick={confirmAppUserAction}
            >
              {appUserActionDialog.action === 'ban' ? 'Ban User' : 'Activate User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;