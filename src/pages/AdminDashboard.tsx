
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { UserCog, Calendar, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <Layout>
      <div className="container py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.full_name || 'Admin'}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">User Management</CardTitle>
              <UserCog className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Manage user accounts and permissions
              </CardDescription>
              <Link to="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Event Management</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Create and manage events and sessions
              </CardDescription>
              <Link to="/admin/events">
                <Button className="w-full">
                  Manage Events
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Reservations</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                View and manage all user reservations
              </CardDescription>
              <Link to="/admin/reservations">
                <Button className="w-full">
                  View Reservations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
