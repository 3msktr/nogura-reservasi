
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { UserCog, Phone, Mail } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const AccountPage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordUpdate, setIsPasswordUpdate] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      fullName: profile?.full_name || '',
      email: user?.email || '',
      phoneNumber: profile?.phone_number || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Update form values when profile/user data is loaded
      form.reset({
        fullName: profile?.full_name || '',
        email: user?.email || '',
        phoneNumber: profile?.phone_number ? profile.phone_number.replace(/^\+62/, '') : '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, profile, navigate, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Format phone number to include +62 prefix if it doesn't already have it
      const formattedPhoneNumber = data.phoneNumber.startsWith('+62') 
        ? data.phoneNumber 
        : `+62${data.phoneNumber.replace(/^0+/, '')}`;
      
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone_number: formattedPhoneNumber,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;
        toast.success('Email update initiated. Please check your inbox to confirm the change.');
      }

      // Update password if requested
      if (isPasswordUpdate && data.currentPassword && data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          toast.error('New passwords do not match');
          setIsLoading(false);
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (passwordError) throw passwordError;
        
        // Clear password fields after update
        form.setValue('currentPassword', '');
        form.setValue('newPassword', '');
        form.setValue('confirmPassword', '');
        setIsPasswordUpdate(false);
        toast.success('Password updated successfully');
      }

      toast.success('Account information updated successfully');
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.message || 'Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading account information...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <UserCog size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">Manage Account</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile.full_name || 'User'}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  {profile.phone_number && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Phone size={14} />
                      {profile.phone_number}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail size={16} className="text-muted-foreground" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone size={16} className="text-muted-foreground" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-3 flex items-center text-muted-foreground">
                                  <span className="text-xs">+62</span>
                                </div>
                                <Input 
                                  {...field} 
                                  type="tel" 
                                  className="pl-12"
                                  placeholder="8123456789" 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="security">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPasswordUpdate(!isPasswordUpdate)}
                          className="mb-4"
                        >
                          {isPasswordUpdate ? 'Cancel Password Change' : 'Change Password'}
                        </Button>

                        {isPasswordUpdate && (
                          <div className="space-y-4 mt-4">
                            <FormField
                              control={form.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
