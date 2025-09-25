import { useState, useMemo } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import * as usersService from '@/services/users';
import * as projectService from '@/services/project';
import { useEffect } from 'react';
import { 
  UserHeader, 
  UserStats, 
  UserFilters, 
  UserCard, 
  UserEmptyState 
} from "@/components/users";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  // annotate owner flag
        const annotated = (list as any[]).map(u => ({ ...u, isProjectOwner: !!(project && project.createdById === u.id) }));
  setUsers(annotated as any);
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

  // Stats calculations
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    owners: users.filter(u => u.isProjectOwner).length
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
          {loading ? <StatsSkeleton /> : <UserStats users={users} />}

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
    </div>
  );
};

export default Users;