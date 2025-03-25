
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  userName?: string; // Optional user name to show in dialog
}

const DeleteUserDialog = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  isDeleting,
  userName
}: DeleteUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Pengguna {userName ? `"${userName}"` : ''}</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Batal
          </Button>
          <Button 
            variant="destructive"
            onClick={onDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus Pengguna'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
