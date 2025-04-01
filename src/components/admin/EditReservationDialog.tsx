
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reservation } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface EditReservationDialogProps {
  open: boolean;
  reservation: Reservation | null;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    updates: {
      numberOfSeats: number;
      contactName: string;
      phoneNumber: string;
      allergyNotes?: string;
      status: "confirmed" | "cancelled" | "pending";
    }
  ) => Promise<boolean>;
}

const EditReservationDialog = ({
  open,
  reservation,
  onOpenChange,
  onSave
}: EditReservationDialogProps) => {
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [allergyNotes, setAllergyNotes] = useState('');
  const [status, setStatus] = useState<"confirmed" | "cancelled" | "pending">("confirmed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when reservation changes
  useEffect(() => {
    if (reservation) {
      setNumberOfSeats(reservation.numberOfSeats);
      setContactName(reservation.contactName || '');
      setPhoneNumber(reservation.phoneNumber ? reservation.phoneNumber.replace(/^\+62/, '') : '');
      setAllergyNotes(reservation.allergyNotes || '');
      setStatus(reservation.status);
    }
  }, [reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    
    setIsSubmitting(true);
    try {
      const success = await onSave(reservation.id, {
        numberOfSeats,
        contactName,
        phoneNumber,
        allergyNotes,
        status
      });
      
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription>
            {reservation.event?.name} - {reservation.event?.date ? formatDate(reservation.event.date) : 'Unknown date'} {reservation.session?.time ? formatTime(reservation.session.time) : 'Unknown time'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfSeats">Number of Seats</Label>
              <Input
                id="numberOfSeats"
                type="number"
                min={1}
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                +62
              </span>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="rounded-l-none"
                placeholder="Phone number without country code"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergyNotes">Allergy Notes</Label>
            <Textarea
              id="allergyNotes"
              value={allergyNotes}
              onChange={(e) => setAllergyNotes(e.target.value)}
              placeholder="Any allergy notes or special requests"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReservationDialog;
