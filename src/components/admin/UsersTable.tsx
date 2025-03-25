
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, ShieldOff, Trash2, Mail, Phone } from 'lucide-react';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  is_admin: boolean;
}

interface UsersTableProps {
  users: UserProfile[];
  onToggleAdminStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersTable = ({ users, onToggleAdminStatus, onDeleteUser }: UsersTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Informasi Kontak</TableHead>
            <TableHead>Status Admin</TableHead>
            <TableHead>Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Tidak ada pengguna yang cocok dengan kriteria pencarian Anda
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || 'Tidak ada nama'}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.email}
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.phone_number}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.is_admin ? 'Admin' : 'Pengguna'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAdminStatus(user.id, user.is_admin)}
                    >
                      {user.is_admin ? (
                        <><ShieldOff className="h-4 w-4 mr-1" /> Hapus Admin</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4 mr-1" /> Jadikan Admin</>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
