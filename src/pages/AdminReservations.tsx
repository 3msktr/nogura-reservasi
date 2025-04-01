
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useReservations } from '@/hooks/useReservations';
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
    clearDateFilter,
    handleUpdateStatus,
    handleEditReservation,
    handleDeleteReservation,
    sendWhatsAppWithLatestTemplate,
    exportToExcel
  } = useReservations();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleWhatsAppClick = (reservation: Reservation) => {
    sendWhatsAppWithLatestTemplate(reservation);
  };

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteDialog(true);
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
