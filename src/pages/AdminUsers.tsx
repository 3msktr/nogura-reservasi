
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserAdminStatus } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { fetchUsers, deleteUser } from '@/services/userService';
import { UserProfile } from '@/components/admin/UsersTable';
import UserMetricsCards from '@/components/admin/UserMetricsCards';
import UserSearchBar from '@/components/admin/UserSearchBar';
import UsersTable from '@/components/admin/UsersTable';
import AddUserDialog from '@/components/admin/AddUserDialog';
import DeleteUserDialog from '@/components/admin/DeleteUserDialog';
import UsersPagination from '@/components/admin/UsersPagination';

// Number of users to display per page
const USERS_PER_PAGE = 10;

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // User metrics
  const totalUsers = filteredUsers.length;
  const adminUsers = filteredUsers.filter(user => user.is_admin).length;
  const regularUsers = totalUsers - adminUsers;

  useEffect(() => {
    // Redirect if not admin
    if (isAdmin === false) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        (user.full_name?.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) ||
        user.phone_number?.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Update paginated users when filtered users or current page changes
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    setTotalPages(totalFilteredPages || 1);
    
    // Ensure current page is valid
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
      return;
    }
    
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await fetchUsers();
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of user table for better UX
    window.scrollTo({
      top: document.getElementById('users-table')?.offsetTop || 0,
      behavior: 'smooth',
    });
  };

  const handleToggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const success = await setUserAdminStatus(userId, !currentStatus);
      
      if (success) {
        // Update local state
        const updatedUsers = users.map(user => 
          user.id === userId 
            ? { ...user, is_admin: !currentStatus } 
            : user
        );
        setUsers(updatedUsers);

        // Update filtered users too
        setFilteredUsers(prevFiltered => 
          prevFiltered.map(user => 
            user.id === userId 
              ? { ...user, is_admin: !currentStatus } 
              : user
          )
        );
        
        toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin role`);
      } else {
        toast.error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setIsDeletingUser(true);
    try {
      await deleteUser(deleteUserId);

      // Remove user from local state
      const updatedUsers = users.filter(user => user.id !== deleteUserId);
      setUsers(updatedUsers);
      setFilteredUsers(prevFiltered => prevFiltered.filter(user => user.id !== deleteUserId));
      
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const openDeleteDialog = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
            
            <AddUserDialog onUserAdded={loadUsers} />

            <DeleteUserDialog 
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              onDelete={handleDeleteUser}
              isDeleting={isDeletingUser}
            />
          </div>

          {/* Search Box */}
          <UserSearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Dashboard Cards */}
          <UserMetricsCards
            totalUsers={totalUsers}
            adminUsers={adminUsers}
            regularUsers={regularUsers}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div id="users-table">
              <UsersTable 
                users={paginatedUsers}
                onToggleAdminStatus={handleToggleAdminStatus}
                onDeleteUser={openDeleteDialog}
              />
              
              {/* Pagination */}
              <UsersPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              
              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground text-center mt-2">
                {filteredUsers.length > 0 ? (
                  <>
                    Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                  </>
                ) : (
                  <p>No users found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
