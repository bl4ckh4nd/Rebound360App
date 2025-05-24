import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Loader2, CheckCircle, XCircle, Settings, Key, Truck, TestTube } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface DHLSettings {
  isConfigured: boolean;
  clientId: string | null;
  baseUrl: string;
}

export function DHLSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<DHLSettings>({
    isConfigured: false,
    clientId: null,
    baseUrl: 'https://api-eu.dhl.com'
  });
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/shipping/settings/dhl');
      const result = await response.json();

      if (response.ok) {
        setSettings(result.data);
        setFormData({
          clientId: result.data.clientId || '',
          clientSecret: ''
        });
      } else {
        throw new Error(result.error || 'Failed to fetch DHL settings');
      }
    } catch (error) {
      console.error('Error fetching DHL settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch DHL settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!formData.clientId.trim() || !formData.clientSecret.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Both Client ID and Client Secret are required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/shipping/settings/dhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: formData.clientId.trim(),
          clientSecret: formData.clientSecret.trim()
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'DHL credentials saved successfully'
        });
        
        // Clear the secret field for security
        setFormData(prev => ({ ...prev, clientSecret: '' }));
        fetchSettings();
      } else {
        throw new Error(result.error || 'Failed to save DHL credentials');
      }
    } catch (error) {
      console.error('Error saving DHL credentials:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save DHL credentials',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.isConfigured) {
      toast({
        title: 'Configuration Required',
        description: 'Please save your DHL credentials first',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/shipping/settings/dhl/test', {
        method: 'POST'
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Connection Test Successful',
          description: result.message || 'DHL API connection is working correctly'
        });
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing DHL connection:', error);
      toast({
        title: 'Connection Test Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to DHL API',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch('/api/shipping/settings/dhl', {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'DHL credentials deleted successfully'
        });
        
        setFormData({ clientId: '', clientSecret: '' });
        fetchSettings();
      } else {
        throw new Error(result.error || 'Failed to delete DHL credentials');
      }
    } catch (error) {
      console.error('Error deleting DHL credentials:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete DHL credentials',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading DHL settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          DHL API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {settings.isConfigured ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Not Configured</span>
                </>
              )}
            </div>
            <Badge variant={settings.isConfigured ? 'default' : 'secondary'}>
              {settings.isConfigured ? 'Ready' : 'Setup Required'}
            </Badge>
          </div>
          {settings.isConfigured && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          )}
        </div>

        <Separator />

        {/* Configuration Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dhl-client-id">DHL Client ID</Label>
            <Input
              id="dhl-client-id"
              type="text"
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="Enter your DHL API Client ID"
            />
            <p className="text-sm text-muted-foreground">
              Your DHL API Client ID from the Developer Portal
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dhl-client-secret">DHL Client Secret</Label>
            <Input
              id="dhl-client-secret"
              type="password"
              value={formData.clientSecret}
              onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
              placeholder={settings.isConfigured ? "Enter new secret to update" : "Enter your DHL API Client Secret"}
            />
            <p className="text-sm text-muted-foreground">
              Your DHL API Client Secret. This will be stored securely.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dhl-base-url">API Base URL</Label>
            <Input
              id="dhl-base-url"
              type="text"
              value={settings.baseUrl}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              The DHL API endpoint. Use the EU endpoint for European operations.
            </p>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || (!formData.clientId.trim() || !formData.clientSecret.trim())}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  {settings.isConfigured ? 'Update Credentials' : 'Save Credentials'}
                </>
              )}
            </Button>

            {settings.isConfigured && (
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
          </div>

          {settings.isConfigured && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Credentials'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete DHL Credentials</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the stored DHL API credentials? 
                    This action cannot be undone and will disable all DHL shipping functionality.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Credentials
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Help Section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Getting DHL API Credentials
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>1. Visit the <a href="https://developer.dhl.com" target="_blank" rel="noopener noreferrer" className="underline">DHL Developer Portal</a></p>
            <p>2. Create an account or sign in</p>
            <p>3. Create a new application</p>
            <p>4. Copy your Client ID and Client Secret</p>
            <p>5. Paste them here and save</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}