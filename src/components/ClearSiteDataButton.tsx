
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { clearAllSiteData } from '@/utils/clearSiteData';
import { toast } from 'sonner';

interface ClearSiteDataButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ClearSiteDataButton: React.FC<ClearSiteDataButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const handleClearData = async () => {
    try {
      toast.loading('Clearing site data...');
      await clearAllSiteData();
      toast.success('Site data cleared successfully');
      
      // Small delay before reload to ensure the toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing site data:', error);
      toast.error('Failed to clear site data');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClearData}
      className={className}
      title="Clear site data (cache, cookies, storage)"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Clear Site Data
    </Button>
  );
};

export default ClearSiteDataButton;
