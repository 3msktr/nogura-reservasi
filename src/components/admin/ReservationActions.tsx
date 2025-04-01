
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReservationActionsProps {
  id: string;
  eventId: string;
  status: string;
  phoneNumber?: string;
  onUpdateStatus: (id: string, newStatus: 'confirmed' | 'cancelled') => void;
  onWhatsAppClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const ReservationActions = ({
  id,
  eventId,
  status,
  phoneNumber,
  onUpdateStatus,
  onWhatsAppClick,
  onEditClick,
  onDeleteClick
}: ReservationActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end space-x-1">
      {status !== 'confirmed' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStatus(id, 'confirmed')}
          title="Confirm Reservation"
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
      )}
      {status !== 'cancelled' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStatus(id, 'cancelled')}
          title="Cancel Reservation"
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        title="Edit Reservation"
      >
        <Edit className="h-4 w-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDeleteClick}
        title="Delete Reservation"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      {status === 'confirmed' && phoneNumber && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onWhatsAppClick}
          title="Send WhatsApp Message"
        >
          <MessageSquare className="h-4 w-4 text-green-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/event/${eventId}`)}
        title="View Event"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReservationActions;
