
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { MessageSquare, Save } from 'lucide-react';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

const AdminMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState<MessageTemplate | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      content: '',
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (currentTemplate) {
      form.reset({
        name: currentTemplate.name,
        content: currentTemplate.content
      });
    }
  }, [currentTemplate, form]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      
      // Set the first template as current if available
      if (data && data.length > 0) {
        setCurrentTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load message templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (values: { name: string; content: string }) => {
    try {
      if (currentTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('message_templates')
          .update({
            name: values.name,
            content: values.content
          })
          .eq('id', currentTemplate.id);

        if (error) throw error;
        
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const { error } = await supabase
          .from('message_templates')
          .insert({
            name: values.name,
            content: values.content
          });

        if (error) throw error;
        
        toast.success('Template created successfully');
      }
      
      // Refresh templates
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
    form.reset({
      name: '',
      content: getDefaultTemplate()
    });
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setCurrentTemplate(template);
  };

  const getDefaultTemplate = (): string => {
    return `Hello {guestName},

Your reservation for *{eventName}* has been confirmed!

🗓️ Date: {eventDate}
⏰ Time: {sessionTime}
👥 Seats: {seats}

Please arrive 15 minutes before your scheduled time. We look forward to seeing you!

Best regards,
The Event Team`;
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <Button onClick={handleCreateNew}>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
                <CardDescription>
                  Select a template to edit or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templates.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-2">No templates found. Create your first template.</p>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            currentTemplate?.id === template.id
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {template.content.substring(0, 50)}...
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{currentTemplate ? 'Edit Template' : 'New Template'}</CardTitle>
                <CardDescription>
                  Customize your confirmation message template. Use placeholders like {'{guestName}'}, {'{eventName}'}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveTemplate)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Default Confirmation" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this message template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your template message here..."
                              className="min-h-[300px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use these placeholders: {'{guestName}'}, {'{eventName}'}, {'{eventDate}'}, {'{sessionTime}'}, {'{seats}'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminMessageTemplates;
