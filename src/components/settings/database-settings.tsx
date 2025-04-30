import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { 
  useDatabaseSettings, 
  useUpdateDatabaseSettings, 
  useTestDatabaseConnection 
} from '../../renderer/hooks/useSettings'
import { useSync } from '../../renderer/hooks/useSync'
import { DatabaseSettings as DbSettingsType } from '../../shared/types'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface SyncResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
}

export function DatabaseSettings() {
  const { data: settings, isPending: isLoadingSettings } = useDatabaseSettings()
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateDatabaseSettings()
  const { mutate: testConnection, isPending: isTesting, data: testResult } = useTestDatabaseConnection()
  const { 
    syncAll, 
    isSyncingAll, 
    allSyncError,
    testConnection: testJtlConnection,
    isTestingConnection
  } = useSync()
  
  const [formData, setFormData] = useState<Partial<DbSettingsType>>({})
  const [showPassword, setShowPassword] = useState(false)
  
  // Initialize form with existing settings when they load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        host: settings.host,
        port: settings.port,
        database: settings.database,
        username: settings.username,
        connectionTimeout: settings.connectionTimeout,
        useSSL: settings.useSSL
      })
    }
  }, [settings])
  
  // Log testResult whenever it changes
  useEffect(() => {
    console.log('[DatabaseSettings] testResult state updated:', testResult);
  }, [testResult]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }
  
  const handleSave = () => {
    updateSettings(formData)
  }
  
  const handleTest = async () => {
    // Gather current settings, prioritizing form data over existing settings
    const currentHost = formData.host || settings?.host;
    const currentPort = formData.port || settings?.port;
    const currentDatabase = formData.database || settings?.database;
    const currentUsername = formData.username || settings?.username;

    // Only test if we have all required settings
    if (!currentHost || !currentPort || !currentDatabase || !currentUsername) {
      toast.warning('Bitte füllen Sie Hostname, Port, Datenbankname und Benutzername aus, um die Verbindung zu testen.');
      return;
    }
    
    const testSettings = {
      host: currentHost,
      port: currentPort,
      database: currentDatabase,
      username: currentUsername,
      password: formData.password || settings?.password || '', // Prioritize new password input
      connectionTimeout: formData.connectionTimeout || settings?.connectionTimeout || 30000,
      useSSL: formData.useSSL ?? settings?.useSSL ?? false,
      isConnected: false, // These fields might be state managed by the hook, but included for completeness if needed by backend
      lastConnectionTest: '' // Ditto
    }

    console.log('[DatabaseSettings handleTest] Calling testConnection with settings:', { ...testSettings, password: '****' });
    // Use the mutate function with onSuccess and onError callbacks for toasts
    testConnection(testSettings, {
      onSuccess: (data) => {
        console.log('[DatabaseSettings handleTest] onSuccess received data:', data);
        // Check if data is received and has the expected property
        if (data && typeof data.success !== 'undefined') {
          // Use the received data for the toast
          if (data.success) {
            toast.success(data.message || 'Verbindung erfolgreich!');
          } else {
            toast.error(data.message || 'Verbindung fehlgeschlagen.');
          }
        } else {
          // Fallback if data is not as expected in onSuccess
          // The main result display (testResult) should still update correctly via the hook's state
          toast.info('Verbindungstest abgeschlossen. Ergebnis wird unten angezeigt.');
          console.warn('Test connection onSuccess callback received undefined or unexpected data:', data);
        }
      },
      onError: (error) => {
        console.error('[DatabaseSettings handleTest] onError received error:', error);
        toast.error(`Verbindungstest fehlgeschlagen: ${(error as Error).message}`);
        // Optionally clear the testResult display here if needed
        // setTestResult(null); // Assuming you have a setter if testResult wasn't from the hook directly
      }
    })
  }

  const handleSync = async () => {
    try {
      const connectionTest = await testJtlConnection();
      if (!connectionTest.success) {
        toast.error('Connection test failed. Please check your settings.');
        return;
      }

      // Use Promise to handle the mutation
      const results = await new Promise<SyncResult[]>((resolve) => {
        syncAll(undefined, {
          onSuccess: (data) => resolve(data),
          onError: (error) => {
            throw error;
          }
        });
      });

      if (results.every((r: SyncResult) => r.success)) {
        toast.success('Sync completed successfully');
      } else {
        const failedOps = results.filter((r: SyncResult) => !r.success);
        toast.error(`Sync partially failed: ${failedOps.map((f: SyncResult) => f.message).join(', ')}`);
      }
    } catch (error) {
      toast.error(`Sync failed: ${(error as Error).message}`);
    }
  }
  
  const toggleSSL = (checked: boolean) => {
    setFormData(prev => ({ ...prev, useSSL: checked }))
  }
  
  if (isLoadingSettings) {
    return <div className="flex justify-center p-6"><Loader2 className="animate-spin h-8 w-8" /></div>
  }
  
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host">Hostname / IP-Adresse</Label>
          <Input
            id="host"
            name="host"
            placeholder="localhost"
            value={formData.host || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            name="port"
            type="number"
            placeholder="1433"
            value={formData.port || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="database">Datenbankname</Label>
          <Input
            id="database"
            name="database"
            placeholder="eazybusiness"
            value={formData.database || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="connectionTimeout">Timeout (ms)</Label>
          <Input
            id="connectionTimeout"
            name="connectionTimeout"
            type="number"
            placeholder="30000"
            value={formData.connectionTimeout || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Benutzername</Label>
          <Input
            id="username"
            name="username"
            placeholder="Datenbankbenutzer"
            value={formData.username || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={settings?.password ? "••••••••" : "Passwort eingeben"}
            value={formData.password || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showPassword"
          checked={showPassword}
          onCheckedChange={(checked) => setShowPassword(!!checked)}
        />
        <Label htmlFor="showPassword">Passwort anzeigen</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="useSSL"
          checked={formData.useSSL || false}
          onCheckedChange={toggleSSL}
        />
        <Label htmlFor="useSSL">SSL-Verschlüsselung verwenden</Label>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-md flex items-center space-x-2 ${
          testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {testResult.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button onClick={handleTest} disabled={isTesting || isUpdating}>
          {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verbindung testen
        </Button>
        
        <Button onClick={handleSave} disabled={isTesting || isUpdating} variant="outline">
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Speichern
        </Button>

        <Button 
          onClick={handleSync} 
          disabled={isSyncingAll || isTestingConnection}
          variant="secondary"
        >
          {(isSyncingAll || isTestingConnection) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {!isSyncingAll && !isTestingConnection && (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Daten synchronisieren
        </Button>
      </div>
    </div>
  )
}