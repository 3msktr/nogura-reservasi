
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SiteSettings } from '@/services/settingsService';
import ClockColorSelector from './ClockColorSelector';
import ClockSizeSelector from './ClockSizeSelector';
import ClockPreview from './ClockPreview';

// Define color options outside the component to avoid recreating on each render
const colorOptions = [
  { value: 'text-primary', label: 'Primary' },
  { value: 'text-secondary', label: 'Secondary' },
  { value: 'text-muted-foreground', label: 'Muted' },
  { value: 'text-foreground', label: 'Default' },
  { value: 'text-destructive', label: 'Red' },
  { value: 'text-blue-500', label: 'Blue' },
  { value: 'text-green-500', label: 'Green' },
  { value: 'text-amber-500', label: 'Amber' },
  { value: 'text-purple-500', label: 'Purple' },
  { value: 'text-pink-500', label: 'Pink' },
];

interface ClockSettingsFormProps {
  initialSettings: SiteSettings;
  onSettingsChange: (key: keyof SiteSettings, value: string | number) => void;
}

const ClockSettingsForm: React.FC<ClockSettingsFormProps> = ({
  initialSettings,
  onSettingsChange
}) => {
  const [clockColor, setClockColor] = useState(initialSettings.clock_color || 'text-muted-foreground');
  const [clockSize, setClockSize] = useState(initialSettings.clock_size || 18);
  const [clockFontSize, setClockFontSize] = useState(initialSettings.clock_font_size || 16);

  useEffect(() => {
    setClockColor(initialSettings.clock_color || 'text-muted-foreground');
    setClockSize(initialSettings.clock_size || 18);
    setClockFontSize(initialSettings.clock_font_size || 16);
  }, [initialSettings]);

  const handleColorChange = (color: string) => {
    setClockColor(color);
    onSettingsChange('clock_color', color);
  };

  const handleSizeChange = (size: number) => {
    setClockSize(size);
    onSettingsChange('clock_size', size);
  };

  const handleFontSizeChange = (size: number) => {
    setClockFontSize(size);
    onSettingsChange('clock_font_size', size);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clock Appearance</CardTitle>
        <CardDescription>
          Customize how the clock looks on your homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ClockColorSelector
          selectedColor={clockColor}
          onColorChange={handleColorChange}
          colorOptions={colorOptions}
        />

        <ClockSizeSelector
          value={clockSize}
          onChange={handleSizeChange}
          min={14}
          max={32}
          label="Clock Icon Size"
        />

        <ClockSizeSelector
          value={clockFontSize}
          onChange={handleFontSizeChange}
          min={12}
          max={24}
          label="Clock Font Size"
        />

        <ClockPreview
          textColor={clockColor}
          iconSize={clockSize}
          fontSize={clockFontSize}
        />
      </CardContent>
    </Card>
  );
};

export default ClockSettingsForm;
