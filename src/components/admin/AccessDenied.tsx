
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "You need administrator privileges to access this page." 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessDenied;
