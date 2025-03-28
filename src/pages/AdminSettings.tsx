
import React, { useState } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSettings } from '@/hooks/useSettings';
import { updateSettings } from '@/services/settingsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import Clock from '@/components/Clock';

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

const AdminSettings = () => {
  const { settings, isLoading } = useSettings();
  const [taglineText, setTaglineText] = useState(settings.tagline_text || '');
  const [clockColor, setClockColor] = useState(settings.clock_color || 'text-muted-foreground');
  const [clockSize, setClockSize] = useState(settings.clock_size || 18);
  const [clockFontSize, setClockFontSize] = useState(settings.clock_font_size || 16);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setTaglineText(settings.tagline_text || '');
      setClockColor(settings.clock_color || 'text-muted-foreground');
      setClockSize(settings.clock_size || 18);
      setClockFontSize(settings.clock_font_size || 16);
    }
  }, [isLoading, settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateSettings({
        id: settings.id,
        tagline_text: taglineText,
        clock_color: clockColor,
        clock_size: clockSize,
        clock_font_size: clockFontSize
      });

      if (result.success) {
        toast.success('Settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize the appearance of your site
          </p>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="mb-8">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="clock">Clock Style</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
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
                    onChange={(e) => setTaglineText(e.target.value)}
                    placeholder="Enter your homepage tagline"
                    className="min-h-20"
                  />
                  <p className="text-sm text-muted-foreground">
                    This text appears below the main title on your homepage
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clock">
            <Card>
              <CardHeader>
                <CardTitle>Clock Appearance</CardTitle>
                <CardDescription>
                  Customize how the clock looks on your homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Clock Color</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        type="button"
                        variant={clockColor === color.value ? "default" : "outline"}
                        className={`h-10 justify-start ${clockColor === color.value ? '' : color.value}`}
                        onClick={() => setClockColor(color.value)}
                      >
                        {color.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Clock Icon Size</Label>
                  <div className="pt-2">
                    <Slider
                      value={[clockSize]}
                      min={14}
                      max={32}
                      step={1}
                      onValueChange={(value) => setClockSize(value[0])}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Clock Font Size</Label>
                  <div className="pt-2">
                    <Slider
                      value={[clockFontSize]}
                      min={12}
                      max={24}
                      step={1}
                      onValueChange={(value) => setClockFontSize(value[0])}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <Clock textColor={clockColor} iconSize={clockSize} fontSize={clockFontSize} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
