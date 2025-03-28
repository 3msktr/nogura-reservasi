
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ClockSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  helperText?: string;
}

const ClockSizeSelector: React.FC<ClockSizeSelectorProps> = ({
  value,
  onChange,
  min,
  max,
  label,
  helperText
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="pt-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          onValueChange={(values) => onChange(values[0])}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Small</span>
        <span>Large</span>
      </div>
      {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
    </div>
  );
};

export default ClockSizeSelector;
