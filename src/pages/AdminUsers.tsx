
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

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

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
  }, [searchQuery, users]);

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
      setFilteredUsers(updatedUsers);
      
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
            <UsersTable 
              users={filteredUsers}
              onToggleAdminStatus={handleToggleAdminStatus}
              onDeleteUser={openDeleteDialog}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
