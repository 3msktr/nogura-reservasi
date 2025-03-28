
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteSettingsForm from '@/components/admin/settings/SiteSettingsForm';
import ClockSettingsForm from '@/components/admin/settings/ClockSettingsForm';
import { SiteSettings } from '@/services/settingsService';

const AdminSettings = () => {
  const { settings, isLoading, saveSettings } = useSettings();
  const [updatedSettings, setUpdatedSettings] = useState<SiteSettings>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setUpdatedSettings({
        ...settings
      });
    }
  }, [isLoading, settings]);

  const handleSettingsChange = (key: keyof SiteSettings, value: string | number) => {
    setUpdatedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await saveSettings(updatedSettings);

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
            <SiteSettingsForm 
              initialSettings={settings} 
              onSettingsChange={handleSettingsChange} 
            />
          </TabsContent>

          <TabsContent value="clock">
            <ClockSettingsForm 
              initialSettings={settings} 
              onSettingsChange={handleSettingsChange} 
            />
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
