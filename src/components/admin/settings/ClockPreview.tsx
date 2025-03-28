
import React from 'react';
import Clock from '@/components/Clock';

interface ClockPreviewProps {
  textColor: string;
  iconSize: number;
  fontSize: number;
}

const ClockPreview: React.FC<ClockPreviewProps> = ({ textColor, iconSize, fontSize }) => {
  return (
    <div className="p-4 border rounded-md bg-muted/50">
      <p className="text-sm font-medium mb-2">Preview:</p>
      <Clock textColor={textColor} iconSize={iconSize} fontSize={fontSize} />
    </div>
  );
};

export default ClockPreview;
