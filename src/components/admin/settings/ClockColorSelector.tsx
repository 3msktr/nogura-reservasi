
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ColorOption {
  value: string;
  label: string;
}

interface ClockColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  colorOptions: ColorOption[];
}

const ClockColorSelector: React.FC<ClockColorSelectorProps> = ({
  selectedColor,
  onColorChange,
  colorOptions
}) => {
  return (
    <div className="space-y-2">
      <Label>Clock Color</Label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
        {colorOptions.map((color) => (
          <Button
            key={color.value}
            type="button"
            variant={selectedColor === color.value ? "default" : "outline"}
            className={`h-10 justify-start ${selectedColor === color.value ? '' : color.value}`}
            onClick={() => onColorChange(color.value)}
          >
            {color.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClockColorSelector;
