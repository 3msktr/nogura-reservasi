
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reservation } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface DeleteReservationDialogProps {
  open: boolean;
  reservation: Reservation | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<boolean>;
}

const DeleteReservationDialog = ({ 
  open, 
  reservation,
  onOpenChange, 
  onDelete
}: DeleteReservationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!reservation) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(reservation.id);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this reservation? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">{reservation.event?.name}</p>
            <p className="text-sm text-muted-foreground">
              {reservation.event?.date ? formatDate(reservation.event.date) : 'Unknown date'} at {reservation.session?.time ? formatTime(reservation.session.time) : 'Unknown time'}
            </p>
            <p className="text-sm mt-1">
              {reservation.numberOfSeats} {reservation.numberOfSeats === 1 ? 'seat' : 'seats'} • {reservation.contactName || 'No contact name'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteReservationDialog;
