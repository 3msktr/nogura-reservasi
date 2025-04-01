
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageTemplate } from '@/lib/types';
import { useAuth } from '@/contexts/auth';
import TemplateEditor from '@/components/admin/TemplateEditor';
import AccessDenied from '@/components/admin/AccessDenied';
import { 
  fetchTemplate, 
  createTemplate, 
  updateTemplate, 
  getDefaultTemplateContent 
} from '@/services/templateService';

const AdminMessageTemplates = () => {
  const { isAdmin } = useAuth();
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeholders, setPlaceholders] = useState<string[]>([
    'guestName', 'eventName', 'eventDate', 'sessionTime', 'seats'
  ]);
  const [newPlaceholder, setNewPlaceholder] = useState('');

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const templateData = await fetchTemplate();
      
      if (!templateData) {
        // If no template exists, create one
        const defaultContent = getDefaultTemplateContent();
        await createDefaultTemplate(defaultContent);
      } else {
        // Set the template
        setTemplate(templateData);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTemplate = async (defaultContent: string) => {
    try {
      const newTemplate = await createTemplate(
        'Default Confirmation Template', 
        defaultContent
      );
      
      if (newTemplate) {
        setTemplate(newTemplate);
      } else {
        // If createTemplate returns null, try to fetch again
        await loadTemplate();
      }
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
        const success = await updateTemplate(template.id, values);
        
        if (success) {
          // Update local state
          setTemplate({
            ...template,
            name: values.name,
            content: values.content
          });
        }
      } else {
        // Create new template if somehow we don't have one
        const newTemplate = await createTemplate(values.name, values.content);
        
        if (newTemplate) {
          setTemplate(newTemplate);
        } else {
          // If createTemplate returns null, try to fetch again
          await loadTemplate();
        }
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20">
          <AccessDenied />
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
            <TemplateEditor
              template={template}
              isLoading={isLoading}
              onSave={handleSaveTemplate}
              placeholders={placeholders}
              setPlaceholders={setPlaceholders}
              newPlaceholder={newPlaceholder}
              setNewPlaceholder={setNewPlaceholder}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminMessageTemplates;
