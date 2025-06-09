
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Save, Database, Bell, Shield, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    appName: 'Living Goods Commodity Tracker',
    appDescription: 'Community Health Inventory Management System',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    dataRetentionDays: '365',
    maxFileSize: '10',
    allowUserRegistration: false,
    mainColor: '#0066cc',
    secondaryColor: '#ff9900'
  });

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: "Settings Saved",
      description: "All settings have been updated successfully!",
    });
  };

  const handleReset = () => {
    setSettings({
      appName: 'Living Goods Commodity Tracker',
      appDescription: 'Community Health Inventory Management System',
      emailNotifications: true,
      smsNotifications: false,
      autoBackup: true,
      dataRetentionDays: '365',
      maxFileSize: '10',
      allowUserRegistration: false,
      mainColor: '#0066cc',
      secondaryColor: '#ff9900'
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <SettingsIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
          <span>System Settings</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="outline" className="text-sm">
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <SettingsIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Application Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appName" className="text-sm">Application Name</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="appDescription" className="text-sm">Application Description</Label>
            <Textarea
              id="appDescription"
              value={settings.appDescription}
              onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
              rows={3}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Send email alerts for important events</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="smsNotifications" className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Send SMS alerts for critical updates</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Database className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="autoBackup" className="text-sm font-medium">Automatic Backup</Label>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Automatically backup data daily</p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>
          <div>
            <Label htmlFor="dataRetentionDays" className="text-sm">Data Retention Period (Days)</Label>
            <Input
              id="dataRetentionDays"
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings({ ...settings, dataRetentionDays: e.target.value })}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="maxFileSize" className="text-sm">Maximum File Upload Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="allowUserRegistration" className="text-sm font-medium">Allow User Self-Registration</Label>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Allow users to register themselves</p>
            </div>
            <Switch
              id="allowUserRegistration"
              checked={settings.allowUserRegistration}
              onCheckedChange={(checked) => setSettings({ ...settings, allowUserRegistration: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Palette className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Theme Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mainColor" className="text-sm">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="mainColor"
                type="color"
                value={settings.mainColor}
                onChange={(e) => setSettings({ ...settings, mainColor: e.target.value })}
                className="w-12 sm:w-16 h-8 sm:h-10 flex-shrink-0"
              />
              <Input
                value={settings.mainColor}
                onChange={(e) => setSettings({ ...settings, mainColor: e.target.value })}
                placeholder="#0066cc"
                className="text-sm flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondaryColor" className="text-sm">Secondary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondaryColor"
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-12 sm:w-16 h-8 sm:h-10 flex-shrink-0"
              />
              <Input
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                placeholder="#ff9900"
                className="text-sm flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
