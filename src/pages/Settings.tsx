
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <span>System Settings</span>
        </h1>
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Application Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="appDescription">Application Description</Label>
            <Textarea
              id="appDescription"
              value={settings.appDescription}
              onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">Send email alerts for important events</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-sm text-gray-600">Send SMS alerts for critical updates</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <p className="text-sm text-gray-600">Automatically backup data daily</p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>
          <div>
            <Label htmlFor="dataRetentionDays">Data Retention Period (Days)</Label>
            <Input
              id="dataRetentionDays"
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings({ ...settings, dataRetentionDays: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="maxFileSize">Maximum File Upload Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowUserRegistration">Allow User Self-Registration</Label>
              <p className="text-sm text-gray-600">Allow users to register themselves</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mainColor">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="mainColor"
                type="color"
                value={settings.mainColor}
                onChange={(e) => setSettings({ ...settings, mainColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={settings.mainColor}
                onChange={(e) => setSettings({ ...settings, mainColor: e.target.value })}
                placeholder="#0066cc"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondaryColor"
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                placeholder="#ff9900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
