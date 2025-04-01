
import React from 'react';
import { useForm } from "react-hook-form";
import { Save } from 'lucide-react';
import { MessageTemplate } from '@/lib/types';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import PlaceholdersManager from './PlaceholdersManager';

interface TemplateEditorProps {
  template: MessageTemplate | null;
  isLoading: boolean;
  onSave: (values: { name: string; content: string }) => Promise<void>;
  placeholders: string[];
  setPlaceholders: React.Dispatch<React.SetStateAction<string[]>>;
  newPlaceholder: string;
  setNewPlaceholder: React.Dispatch<React.SetStateAction<string>>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isLoading,
  onSave,
  placeholders,
  setPlaceholders,
  newPlaceholder,
  setNewPlaceholder
}) => {
  const form = useForm({
    defaultValues: {
      name: template?.name || 'Default Confirmation Template',
      content: template?.content || '',
    }
  });

  // Update form when template changes
  React.useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        content: template.content
      });
    }
  }, [template, form]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
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

        <PlaceholdersManager 
          placeholders={placeholders}
          setPlaceholders={setPlaceholders}
          newPlaceholder={newPlaceholder}
          setNewPlaceholder={setNewPlaceholder}
          insertPlaceholder={insertPlaceholder}
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
  );
};

export default TemplateEditor;
