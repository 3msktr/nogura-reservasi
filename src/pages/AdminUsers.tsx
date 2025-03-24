
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { setUserAdminStatus } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Trash2, ShieldCheck, ShieldOff, Search, Mail, Phone } from 'lucide-react';

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  is_admin: boolean;
};

// Define types for Supabase auth admin response
interface AdminUsersResponse {
  users?: Array<{
    id: string;
    email?: string;
  }>;
  error?: Error;
}

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
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
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, is_admin');

      if (profilesError) throw profilesError;

      // Then, fetch all user emails from the auth.users table via Supabase admin API
      const { data: adminResponse, error: usersError } = await supabase.auth.admin.listUsers() as { 
        data: AdminUsersResponse;
        error: Error | null;
      };

      if (usersError) {
        // If admin API isn't available (likely in dev), we'll use dummy emails
        console.warn('Unable to fetch actual user emails, using placeholder emails');
        
        const usersWithEmails = profiles.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          is_admin: profile.is_admin || false,
          email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
        }));
        
        setUsers(usersWithEmails);
        setFilteredUsers(usersWithEmails);
      } else {
        // Map the emails to the profiles
        const adminUsers = adminResponse?.users || [];
        
        const usersWithEmails = profiles.map(profile => {
          const userRecord = adminUsers.find(u => u.id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name,
            phone_number: profile.phone_number,
            is_admin: profile.is_admin || false,
            email: userRecord?.email || `user-${profile.id.substring(0, 8)}@example.com`,
          };
        });
        
        setUsers(usersWithEmails);
        setFilteredUsers(usersWithEmails);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserFullName || !newUserPassword) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsAddingUser(true);
    try {
      // Sign up the new user
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserFullName,
            phone_number: newUserPhone || null,
          },
        },
      });

      if (error) throw error;

      toast.success('User added successfully! They will need to confirm their email.');
      setIsAddUserDialogOpen(false);
      setNewUserEmail('');
      setNewUserFullName('');
      setNewUserPassword('');
      setNewUserPhone('');
      
      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setIsDeletingUser(true);
    try {
      // In a real app, this would be a server-side function or Supabase function
      // For this demo, we'll just remove the user from our profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteUserId);

      if (error) throw error;

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

  return (
    <Layout>
      <div className="container py-20">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
            
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account. They will receive an email to confirm their registration.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+1234567890 (optional)"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsAddUserDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddUser} 
                    disabled={isAddingUser}
                  >
                    {isAddingUser ? 'Adding...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteUser} 
                    disabled={isDeletingUser}
                  >
                    {isDeletingUser ? 'Deleting...' : 'Delete User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dashboard Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  With administrative access
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regularUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard access accounts
                </p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Admin Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name || 'No name'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAdminStatus(user.id, user.is_admin)}
                          >
                            {user.is_admin ? (
                              <><ShieldOff className="h-4 w-4 mr-1" /> Remove Admin</>
                            ) : (
                              <><ShieldCheck className="h-4 w-4 mr-1" /> Make Admin</>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteUserId(user.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
