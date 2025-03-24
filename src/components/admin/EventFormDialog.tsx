
import React from 'react';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEvent: Partial<Event> | null;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: string, value: any) => void;
}

const EventFormDialog = ({
  open,
  onOpenChange,
  currentEvent,
  isEditing,
  onSubmit,
  onFieldChange,
}: EventFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentEvent?.name || ''}
                onChange={(e) => onFieldChange('name', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentEvent?.description || ''}
                onChange={(e) => onFieldChange('description', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={currentEvent?.date?.substring(0, 10) || ''}
                onChange={(e) => onFieldChange('date', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isOpen" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isOpen"
                  checked={currentEvent?.isOpen || false}
                  onCheckedChange={(checked) => onFieldChange('isOpen', checked)}
                />
                <Label htmlFor="isOpen" className="text-sm text-muted-foreground">
                  {currentEvent?.isOpen ? 'Open for Reservations' : 'Closed for Reservations'}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxReservations" className="text-right">
                Max Reservations
              </Label>
              <Input
                id="maxReservations"
                type="number"
                min="1"
                value={currentEvent?.maxReservationsPerUser || 4}
                onChange={(e) => onFieldChange('maxReservationsPerUser', parseInt(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Create Event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;
