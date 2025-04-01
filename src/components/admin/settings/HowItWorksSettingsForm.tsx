
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SiteSettings } from '@/services/settingsService';

interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksSettingsFormProps {
  initialSettings: SiteSettings;
  onSettingsChange: (key: keyof SiteSettings, value: any) => void;
}

const HowItWorksSettingsForm: React.FC<HowItWorksSettingsFormProps> = ({
  initialSettings,
  onSettingsChange
}) => {
  const [title, setTitle] = useState(initialSettings.how_it_works_title || 'How It Works');
  const [description, setDescription] = useState(
    initialSettings.how_it_works_description || 
    'Our unique war ticket reservation system ensures everyone has a fair chance to secure their seats.'
  );
  const [steps, setSteps] = useState<HowItWorksStep[]>(
    initialSettings.how_it_works_steps || [
      { 
        title: 'Watch the Timer', 
        description: 'Monitor the countdown timer to know exactly when reservations will open.' 
      },
      { 
        title: 'Select Your Session', 
        description: 'Choose your preferred time slot from the available sessions.' 
      },
      { 
        title: 'Confirm Your Seats', 
        description: 'Quickly secure your reservation before all seats are taken.' 
      },
    ]
  );

  useEffect(() => {
    if (initialSettings) {
      setTitle(initialSettings.how_it_works_title || title);
      setDescription(initialSettings.how_it_works_description || description);
      setSteps(initialSettings.how_it_works_steps || steps);
    }
  }, [initialSettings]);

  useEffect(() => {
    onSettingsChange('how_it_works_title', title);
    onSettingsChange('how_it_works_description', description);
    onSettingsChange('how_it_works_steps', steps);
  }, [title, description, steps, onSettingsChange]);

  const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: '', description: '' }]);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works Section</CardTitle>
        <CardDescription>
          Customize the "How It Works" section that appears on your homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="how-it-works-title">Section Title</Label>
          <Input
            id="how-it-works-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter section title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="how-it-works-description">Section Description</Label>
          <Textarea
            id="how-it-works-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter section description"
            className="min-h-20"
          />
          <p className="text-sm text-muted-foreground">
            This text appears below the section title on your homepage
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>How It Works Steps</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addStep}
              type="button"
            >
              Add Step
            </Button>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="space-y-3 border rounded-md p-4 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeStep(index)} 
                className="absolute top-2 right-2 h-6 w-6"
                type="button"
                disabled={steps.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="pt-2">
                <Label htmlFor={`step-${index}-title`}>Step {index + 1} Title</Label>
                <Input
                  id={`step-${index}-title`}
                  value={step.title}
                  onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  placeholder="Enter step title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor={`step-${index}-description`}>Step {index + 1} Description</Label>
                <Textarea
                  id={`step-${index}-description`}
                  value={step.description}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  placeholder="Enter step description"
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorksSettingsForm;
