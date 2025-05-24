import { useState, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { DatabaseSettings } from './settings/database-settings'
import { WorkflowSettings } from './settings/workflow-settings'
import { ReasonSettings } from './settings/reason-settings'
import { CustomFieldsSettings } from './settings/custom-fields-settings'
import { DHLSettings } from './settings/dhl-settings'

export function Settings() {
  const [activeTab, setActiveTab] = useState<string>('database')
  const tabsRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>
      
      <Tabs ref={tabsRef} defaultValue="database" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex w-full max-w-4xl justify-start gap-1">
          <TabsTrigger value="database" className="flex-1 min-w-[180px]">Datenbankverbindung</TabsTrigger>
          <TabsTrigger value="workflow" className="flex-1 min-w-[150px]">Status-Workflows</TabsTrigger>
          <TabsTrigger value="custom-fields" className="flex-1 min-w-[180px]">Benutzerdefinierte Felder</TabsTrigger>
          <TabsTrigger value="reasons" className="flex-1 min-w-[100px]">Gründe</TabsTrigger>
          <TabsTrigger value="dhl" className="flex-1 min-w-[120px]">DHL Versand</TabsTrigger>
        </TabsList>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Datenbankverbindung</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Verbindung zur JTL Wawi Datenbank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabaseSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Status-Workflows</CardTitle>
              <CardDescription>
                Definieren Sie benutzerdefinierte Status-Abläufe für verschiedene Rückgabearten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom-fields">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerdefinierte Felder</CardTitle>
              <CardDescription>
                Erstellen und verwalten Sie eigene Felder für Ihre Workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomFieldsSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reasons">
          <Card>
            <CardHeader>
              <CardTitle>Rückgabegründe</CardTitle>
              <CardDescription>
                Verwalten Sie die Gründe für Rücksendungen und deren Kategorien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReasonSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dhl">
          <Card>
            <CardHeader>
              <CardTitle>DHL Versand</CardTitle>
              <CardDescription>
                Konfigurieren Sie die DHL API für automatische Versandetiketten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DHLSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}