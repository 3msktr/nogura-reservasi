
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { clearAllSiteData } from '@/utils/clearSiteData';
import { toast } from 'sonner';

interface RefreshButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const handleRefresh = async () => {
    try {
      toast.loading('Refreshing...');
      await clearAllSiteData();
      toast.success('Refresh successful');
      
      // Small delay before reload to ensure the toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleRefresh}
      className={className}
      title="Refresh data and clear cache"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  );
};

export default RefreshButton;
