
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReservationActionsProps {
  id: string;
  eventId: string;
  status: string;
  phoneNumber?: string;
  onUpdateStatus: (id: string, newStatus: 'confirmed' | 'cancelled') => void;
  onWhatsAppClick: () => void;
}

const ReservationActions = ({
  id,
  eventId,
  status,
  phoneNumber,
  onUpdateStatus,
  onWhatsAppClick
}: ReservationActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end space-x-1">
      {status !== 'confirmed' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStatus(id, 'confirmed')}
          title="Konfirmasi Reservasi"
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
      )}
      {status !== 'cancelled' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStatus(id, 'cancelled')}
          title="Batalkan Reservasi"
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      )}
      {status === 'confirmed' && phoneNumber && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onWhatsAppClick}
          title="Kirim Pesan WhatsApp"
        >
          <MessageSquare className="h-4 w-4 text-green-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/event/${eventId}`)}
        title="Lihat Acara"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReservationActions;
