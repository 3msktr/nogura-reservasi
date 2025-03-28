
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SiteSettings } from '@/services/settingsService';

interface SiteSettingsFormProps {
  initialSettings: SiteSettings;
  onSettingsChange: (key: 'tagline_text', value: string) => void;
}

const SiteSettingsForm: React.FC<SiteSettingsFormProps> = ({ 
  initialSettings, 
  onSettingsChange 
}) => {
  const [taglineText, setTaglineText] = useState(initialSettings.tagline_text || '');

  useEffect(() => {
    setTaglineText(initialSettings.tagline_text || '');
  }, [initialSettings]);

  const handleTaglineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaglineText(e.target.value);
    onSettingsChange('tagline_text', e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Content</CardTitle>
        <CardDescription>
          Customize the text content displayed on your homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tagline">Homepage Tagline</Label>
          <Textarea
            id="tagline"
            value={taglineText}
            onChange={handleTaglineChange}
            placeholder="Enter your homepage tagline"
            className="min-h-20"
          />
          <p className="text-sm text-muted-foreground">
            This text appears below the main title on your homepage
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsForm;
