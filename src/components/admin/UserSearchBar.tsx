
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface UserSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UserSearchBar = ({ searchQuery, setSearchQuery }: UserSearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Cari berdasarkan nama, email, atau telepon..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default UserSearchBar;
