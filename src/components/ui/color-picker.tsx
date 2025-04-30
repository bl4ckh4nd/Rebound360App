import { Input } from './input';
import { Label } from './label';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <div className="flex space-x-2">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded"
        />
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
}