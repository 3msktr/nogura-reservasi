
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface PlaceholdersManagerProps {
  placeholders: string[];
  setPlaceholders: React.Dispatch<React.SetStateAction<string[]>>;
  newPlaceholder: string;
  setNewPlaceholder: React.Dispatch<React.SetStateAction<string>>;
  insertPlaceholder: (placeholder: string) => void;
}

const PlaceholdersManager: React.FC<PlaceholdersManagerProps> = ({
  placeholders,
  setPlaceholders,
  newPlaceholder,
  setNewPlaceholder,
  insertPlaceholder
}) => {
  const addNewPlaceholder = () => {
    if (!newPlaceholder.trim()) {
      toast.error('Please enter a placeholder name');
      return;
    }
    
    if (placeholders.includes(newPlaceholder)) {
      toast.error('This placeholder already exists');
      return;
    }
    
    setPlaceholders([...placeholders, newPlaceholder]);
    setNewPlaceholder('');
  };
  
  const removePlaceholder = (placeholder: string) => {
    if (['guestName', 'eventName', 'eventDate', 'sessionTime', 'seats'].includes(placeholder)) {
      toast.error('Cannot remove default placeholders');
      return;
    }
    
    setPlaceholders(placeholders.filter(p => p !== placeholder));
  };

  return (
    <div className="bg-muted p-4 rounded-md mb-4">
      <div className="font-medium mb-2">Available Placeholders</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {placeholders.map(placeholder => (
          <div 
            key={placeholder} 
            className="flex items-center bg-background border px-2 py-1 rounded-md text-sm"
          >
            <button
              type="button"
              onClick={() => insertPlaceholder(placeholder)}
              className="mr-1 hover:text-primary"
            >
              {`{${placeholder}}`}
            </button>
            <button
              type="button"
              onClick={() => removePlaceholder(placeholder)}
              className="text-destructive ml-1"
            >
              <MinusCircle size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={newPlaceholder}
          onChange={(e) => setNewPlaceholder(e.target.value)}
          placeholder="New placeholder name"
          className="flex-grow"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={addNewPlaceholder}
          size="sm"
        >
          <PlusCircle size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default PlaceholdersManager;
