
import React from 'react';
import { Reservation } from '@/lib/types';
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappMessage: string;
  setWhatsappMessage: (message: string) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  templates: MessageTemplate[];
  onSend: () => void;
}

const WhatsAppMessageDialog = ({
  open,
  onOpenChange,
  whatsappMessage,
  setWhatsappMessage,
  selectedTemplateId,
  setSelectedTemplateId,
  templates,
  onSend
}: WhatsAppMessageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>WhatsApp Confirmation Message</DialogTitle>
          <DialogDescription>
            Choose a template or customize the message before sending.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Choose Template
            </label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <SelectItem value="none" disabled>No templates available</SelectItem>
                ) : (
                  templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Textarea 
            value={whatsappMessage} 
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} className="bg-green-600 hover:bg-green-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            Open in WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppMessageDialog;
