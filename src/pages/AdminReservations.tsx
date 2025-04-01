
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useReservations } from '@/hooks/useReservations';
import WhatsAppMessageDialog from '@/components/admin/WhatsAppMessageDialog';
import DateFilterPopover from '@/components/admin/DateFilterPopover';
import ActiveFilterDisplay from '@/components/admin/ActiveFilterDisplay';
import ReservationsTable from '@/components/admin/ReservationsTable';
import EditReservationDialog from '@/components/admin/EditReservationDialog';
import DeleteReservationDialog from '@/components/admin/DeleteReservationDialog';
import { Reservation } from '@/lib/types';

const AdminReservations = () => {
  const navigate = useNavigate();
  const {
    filteredReservations,
    isLoading,
    dateRange,
    setDateRange,
    showDateFilter,
    setShowDateFilter,
    templates,
    clearDateFilter,
    handleUpdateStatus,
    handleEditReservation,
    handleDeleteReservation,
    generateWhatsAppTemplate,
    applyTemplateToReservation,
    sendWhatsAppMessage,
    exportToExcel
  } = useReservations();

  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleWhatsAppClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    
    // Use the default WhatsApp template when opening the dialog
    const message = generateWhatsAppTemplate(reservation);
    
    setWhatsappMessage(message);
    setSelectedTemplateId('');
    setShowWhatsAppDialog(true);
  };

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteDialog(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (!selectedReservation) return;
    
    const message = applyTemplateToReservation(templateId, selectedReservation);
    setWhatsappMessage(message);
  };

  const handleSendWhatsApp = () => {
    if (!selectedReservation || !selectedReservation.phoneNumber) return;
    
    sendWhatsAppMessage(selectedReservation.phoneNumber, whatsappMessage);
    setShowWhatsAppDialog(false);
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <div className="flex items-center gap-2">
            <DateFilterPopover
              showDateFilter={showDateFilter}
              setShowDateFilter={setShowDateFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onClear={clearDateFilter}
            />
            
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/admin/message-templates')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </div>
        </div>
        
        <ActiveFilterDisplay 
          dateRange={dateRange}
          resultCount={filteredReservations.length}
          onClear={clearDateFilter}
        />

        <ReservationsTable
          reservations={filteredReservations}
          isLoading={isLoading}
          onUpdateStatus={handleUpdateStatus}
          onWhatsAppClick={handleWhatsAppClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* WhatsApp Dialog */}
      <WhatsAppMessageDialog
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        whatsappMessage={whatsappMessage}
        setWhatsappMessage={setWhatsappMessage}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={handleTemplateChange}
        templates={templates}
        onSend={handleSendWhatsApp}
      />

      {/* Edit Reservation Dialog */}
      <EditReservationDialog
        open={showEditDialog}
        reservation={selectedReservation}
        onOpenChange={setShowEditDialog}
        onSave={handleEditReservation}
      />

      {/* Delete Reservation Dialog */}
      <DeleteReservationDialog
        open={showDeleteDialog}
        reservation={selectedReservation}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDeleteReservation}
      />
    </Layout>
  );
};

export default AdminReservations;
