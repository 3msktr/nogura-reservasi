
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
import { Save, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { MessageTemplate } from '@/lib/types';
import { useAuth } from '@/contexts/auth';

const AdminMessageTemplates = () => {
  const { isAdmin } = useAuth();
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeholders, setPlaceholders] = useState<string[]>([
    'guestName', 'eventName', 'eventDate', 'sessionTime', 'seats'
  ]);
  const [newPlaceholder, setNewPlaceholder] = useState('');

  const form = useForm({
    defaultValues: {
      name: 'Default Confirmation Template',
      content: '',
    }
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        content: template.content
      });
    }
  }, [template, form]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      // Fetch the main template (or first one if multiple exist)
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to load message template');
        throw error;
      }

      if (!data) {
        // If no template exists, create one
        const defaultTemplate = getDefaultTemplate();
        await createDefaultTemplate(defaultTemplate);
        // Set the new template
        setTemplate({
          id: 'new',
          name: 'Default Confirmation Template',
          content: defaultTemplate,
          created_at: new Date().toISOString()
        });
      } else {
        // Map the data to match our MessageTemplate type
        setTemplate({
          id: data.id,
          name: data.name,
          content: data.content,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load message template');
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTemplate = async (defaultContent: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .insert({
          name: 'Default Confirmation Template',
          content: defaultContent
        });

      if (error) throw error;
      toast.success('Default template created');
      fetchTemplate();
    } catch (error) {
      console.error('Error creating default template:', error);
      toast.error('Failed to create default template');
    }
  };

  const handleSaveTemplate = async (values: { name: string; content: string }) => {
    try {
      console.log('Saving template with values:', values);
      console.log('Current template state:', template);
      
      if (template?.id && template.id !== 'new') {
        // Update existing template
        const { error } = await supabase
          .from('message_templates')
          .update({
            name: values.name,
            content: values.content
          })
          .eq('id', template.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast.success('Template updated successfully');
        
        // Update local state
        setTemplate({
          ...template,
          name: values.name,
          content: values.content
        });
      } else {
        // Create new template if somehow we don't have one
        const { data, error } = await supabase
          .from('message_templates')
          .insert({
            name: values.name,
            content: values.content
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast.success('Template created successfully');
        
        // Update local state with the new template data
        if (data) {
          setTemplate({
            id: data.id,
            name: data.name,
            content: data.content,
            created_at: data.created_at
          });
        } else {
          // Refresh to get the latest data
          fetchTemplate();
        }
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message || 'Unknown error'}`);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textArea = document.querySelector('textarea');
    const content = form.getValues('content');
    const cursorPosition = textArea?.selectionStart || content.length;
    
    const textBefore = content.substring(0, cursorPosition);
    const textAfter = content.substring(cursorPosition);
    
    const newContent = `${textBefore}{${placeholder}}${textAfter}`;
    form.setValue('content', newContent);
    
    // Focus back on textarea and set cursor position after the inserted placeholder
    if (textArea) {
      setTimeout(() => {
        textArea.focus();
        const newPosition = cursorPosition + placeholder.length + 2; // +2 for the curly braces
        textArea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const addNewPlaceholder = () => {
    if (!newPlaceholder.trim()) {
      toast.error('Please enter a placeholder name');
      return;
    }
    
    if (placeholders.includes(newPlaceholder)) {
      toast.error('This placeholder already exists');
      return;
    }
    
    setPlaceholders([...placeholders, newPlaceholder]);
    setNewPlaceholder('');
  };
  
  const removePlaceholder = (placeholder: string) => {
    if (['guestName', 'eventName', 'eventDate', 'sessionTime', 'seats'].includes(placeholder)) {
      toast.error('Cannot remove default placeholders');
      return;
    }
    
    setPlaceholders(placeholders.filter(p => p !== placeholder));
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

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You need administrator privileges to access this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Message Template</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Message Template</CardTitle>
            <CardDescription>
              Customize your message template with placeholders for dynamic content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
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

                  <div className="bg-muted p-4 rounded-md mb-4">
                    <div className="font-medium mb-2">Available Placeholders</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {placeholders.map(placeholder => (
                        <div 
                          key={placeholder} 
                          className="flex items-center bg-background border px-2 py-1 rounded-md text-sm"
                        >
                          <button
                            type="button"
                            onClick={() => insertPlaceholder(placeholder)}
                            className="mr-1 hover:text-primary"
                          >
                            {`{${placeholder}}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => removePlaceholder(placeholder)}
                            className="text-destructive ml-1"
                          >
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newPlaceholder}
                        onChange={(e) => setNewPlaceholder(e.target.value)}
                        placeholder="New placeholder name"
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addNewPlaceholder}
                        size="sm"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

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
                          Click a placeholder above to insert it at the cursor position
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminMessageTemplates;
