import React from 'react'
import { FileText, Image, File, Search, SortAsc, SortDesc, Calendar, FileType2, X, RefreshCw, Package, Eye, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DocumentViewer } from './document-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { ReturnItem, Document } from '../shared/types'
import { API_BASE_URL } from '../shared/config'

interface DocumentManagerProps {
  returns: ReturnItem[]
  onDeleteDocument: (documentId: string) => void
  apiUrl?: string
}

export function DocumentManager({ 
  returns, 
  onDeleteDocument,
  apiUrl = API_BASE_URL
}: DocumentManagerProps) {
  const [selectedReturnId, setSelectedReturnId] = React.useState<string | 'all'>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [fileTypeFilter, setFileTypeFilter] = React.useState<'all' | 'images' | 'pdfs' | 'other'>('all')
  const [sortBy, setSortBy] = React.useState<'date' | 'name' | 'size'>('date')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc')
  const [view, setView] = React.useState<'grid' | 'list'>('grid')
  
  // Helper function to format file size - moved up before it's used
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }
  
  // Get all documents across returns
  const allDocuments = React.useMemo(() => {
    const docs: Document[] = []
    returns.forEach(item => {
      if (item.documents?.length) {
        docs.push(...item.documents)
      }
    })
    return docs
  }, [returns])
  
  // Get documents for selected return
  const documentsToShow = React.useMemo(() => {
    if (selectedReturnId === 'all') {
      return allDocuments
    } else {
      const selectedReturn = returns.find(r => r.id === selectedReturnId)
      return selectedReturn?.documents || []
    }
  }, [selectedReturnId, allDocuments, returns])

  // Apply filters
  const filteredDocuments = React.useMemo(() => {
    return documentsToShow
      .filter(doc => {
        // Search filter
        if (searchTerm && 
            !doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !(doc.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false
        }

        // File type filter
        if (fileTypeFilter === 'images' && !doc.fileType.startsWith('image/')) {
          return false
        } else if (fileTypeFilter === 'pdfs' && doc.fileType !== 'application/pdf') {
          return false
        } else if (fileTypeFilter === 'other' && 
                  (doc.fileType.startsWith('image/') || doc.fileType === 'application/pdf')) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortBy === 'date') {
          return sortDirection === 'asc'
            ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
            : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        } else if (sortBy === 'name') {
          return sortDirection === 'asc'
            ? a.fileName.localeCompare(b.fileName)
            : b.fileName.localeCompare(a.fileName)
        } else { // size
          return sortDirection === 'asc'
            ? a.fileSize - b.fileSize
            : b.fileSize - a.fileSize
        }
      })
  }, [documentsToShow, searchTerm, fileTypeFilter, sortBy, sortDirection])
  
  // List of returns that have documents
  const returnsWithDocuments = React.useMemo(() => {
    return returns.filter(r => r.documents?.length)
  }, [returns])
  
  // Stats
  const stats = React.useMemo(() => {
    const totalDocs = allDocuments.length
    const imageCount = allDocuments.filter(doc => doc.fileType.startsWith('image/')).length
    const pdfCount = allDocuments.filter(doc => doc.fileType === 'application/pdf').length
    const otherCount = totalDocs - imageCount - pdfCount
    
    // Calculate total file size
    const totalSize = allDocuments.reduce((sum, doc) => sum + doc.fileSize, 0)
    const formattedSize = formatFileSize(totalSize)
    
    return {
      total: totalDocs,
      images: imageCount,
      pdfs: pdfCount,
      others: otherCount,
      totalSize: formattedSize
    }
  }, [allDocuments])

  // Helper to get return title
  const getReturnTitle = (item: ReturnItem) => {
    return item.supplierReference || item.orderNumber || `Retoure #${item.id}`
  }

  // Handle sort toggle
  const handleSortChange = (field: 'date' | 'name' | 'size') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFileTypeFilter('all')
    setSortBy('date')
    setSortDirection('desc')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Dokumentenverwaltung</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verwalten Sie alle Dokumente zu Ihren Retouren
            </p>
          </div>
          
          <TabsList>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="statistics">Statistik</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Dokumente suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <select
                value={selectedReturnId}
                onChange={(e) => setSelectedReturnId(e.target.value as string | 'all')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background"
              >
                <option value="all">Alle Retouren</option>
                {returnsWithDocuments.map(item => (
                  <option key={item.id} value={item.id}>
                    {getReturnTitle(item)} ({item.documents?.length || 0})
                  </option>
                ))}
              </select>

              <div className="flex gap-1">
                <Button
                  variant={fileTypeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileTypeFilter('all')}
                  title="Alle Dateien"
                >
                  <File className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Alle</span>
                </Button>
                <Button
                  variant={fileTypeFilter === 'images' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileTypeFilter('images')}
                  title="Nur Bilder"
                >
                  <Image className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Bilder</span>
                </Button>
                <Button
                  variant={fileTypeFilter === 'pdfs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileTypeFilter('pdfs')}
                  title="Nur PDFs"
                >
                  <FileText className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">PDFs</span>
                </Button>
                <Button
                  variant={fileTypeFilter === 'other' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileTypeFilter('other')}
                  title="Andere Dateien"
                >
                  <FileType2 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Andere</span>
                </Button>
              </div>
            </div>

            {/* Sort options */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'Dokument' : 'Dokumente'} gefunden
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={sortBy === 'date' ? 'font-semibold' : ''}
                    onClick={() => handleSortChange('date')}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Datum
                    {sortBy === 'date' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={sortBy === 'name' ? 'font-semibold' : ''}
                    onClick={() => handleSortChange('name')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Name
                    {sortBy === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={sortBy === 'size' ? 'font-semibold' : ''}
                    onClick={() => handleSortChange('size')}
                  >
                    <File className="h-4 w-4 mr-1" />
                    Größe
                    {sortBy === 'size' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </div>

                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    className={`px-2 py-1 ${view === 'grid' ? 'bg-muted' : 'bg-background'}`}
                    onClick={() => setView('grid')}
                    title="Grid-Ansicht"
                  >
                    <div className="flex flex-wrap w-4 h-4">
                      <div className="w-1.5 h-1.5 m-0.25 bg-foreground"></div>
                      <div className="w-1.5 h-1.5 m-0.25 bg-foreground"></div>
                      <div className="w-1.5 h-1.5 m-0.25 bg-foreground"></div>
                      <div className="w-1.5 h-1.5 m-0.25 bg-foreground"></div>
                    </div>
                  </button>
                  <button 
                    className={`px-2 py-1 ${view === 'list' ? 'bg-muted' : 'bg-background'}`}
                    onClick={() => setView('list')}
                    title="Listen-Ansicht"
                  >
                    <div className="flex flex-col justify-between w-4 h-4">
                      <div className="h-0.5 bg-foreground"></div>
                      <div className="h-0.5 bg-foreground"></div>
                      <div className="h-0.5 bg-foreground"></div>
                    </div>
                  </button>
                </div>

                {(searchTerm || fileTypeFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="flex items-center"
                    title="Filter zurücksetzen"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    <span>Zurücksetzen</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Documents display */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-muted/10">
                {documentsToShow.length === 0 ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-medium">Keine Dokumente vorhanden</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedReturnId === 'all' 
                        ? 'Es wurden noch keine Dokumente zu Retouren hinzugefügt.' 
                        : 'Für diese Retoure wurden noch keine Dokumente hochgeladen.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-medium">Keine Dokumente gefunden</h3>
                    <p className="text-sm text-muted-foreground">
                      Versuchen Sie andere Suchbegriffe oder Filter.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Filter zurücksetzen
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {view === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredDocuments.map(document => (
                      <DocumentViewer
                        key={document.id}
                        document={document}
                        onDeleteDocument={onDeleteDocument ? () => onDeleteDocument(document.id) : undefined}
                        apiUrl={apiUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="py-2 px-4 text-left text-sm font-medium">Datei</th>
                          <th className="py-2 px-4 text-left text-sm font-medium">Typ</th>
                          <th className="py-2 px-4 text-left text-sm font-medium">Größe</th>
                          <th className="py-2 px-4 text-left text-sm font-medium">Datum</th>
                          <th className="py-2 px-4 text-left text-sm font-medium">Retoure</th>
                          <th className="py-2 px-4 text-right text-sm font-medium">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredDocuments.map(document => {
                          const returnItem = returns.find(r => r.id === document.returnId)
                          const fileIcon = document.fileType.startsWith('image/') 
                            ? <Image className="h-4 w-4 text-blue-500" />
                            : document.fileType === 'application/pdf'
                            ? <FileText className="h-4 w-4 text-red-500" />
                            : <File className="h-4 w-4 text-gray-500" />

                          return (
                            <tr key={document.id} className="hover:bg-muted/50">
                              <td className="py-2 px-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {fileIcon}
                                  <span className="truncate max-w-[200px]">{document.fileName}</span>
                                </div>
                              </td>
                              <td className="py-2 px-4 text-sm">{document.fileType.split('/')[1]}</td>
                              <td className="py-2 px-4 text-sm">{formatFileSize(document.fileSize)}</td>
                              <td className="py-2 px-4 text-sm">{new Date(document.uploadDate).toLocaleDateString()}</td>
                              <td className="py-2 px-4 text-sm">
                                {returnItem ? getReturnTitle(returnItem) : 'Unbekannt'}
                              </td>
                              <td className="py-2 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      // Preview document
                                      const customEvent = new CustomEvent('preview-document', { detail: document as any });
                                      (document as any).dispatchEvent(customEvent);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {onDeleteDocument && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onDeleteDocument(document.id)}
                                    >
                                      <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    Alle Dokumente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Gesamtgröße: {stats.totalSize}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-500" />
                    Bilder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.images}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0 ? Math.round((stats.images / stats.total) * 100) : 0}% aller Dokumente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    PDFs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.pdfs}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0 ? Math.round((stats.pdfs / stats.total) * 100) : 0}% aller Dokumente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType2 className="h-4 w-4 text-gray-500" />
                    Andere Dateien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.others}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0 ? Math.round((stats.others / stats.total) * 100) : 0}% aller Dokumente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Retouren mit Dokumenten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{returnsWithDocuments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {returns.length > 0 ? Math.round((returnsWithDocuments.length / returns.length) * 100) : 0}% aller Retouren
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Returns with documents */}
            {returnsWithDocuments.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm font-medium">Retoure</th>
                      <th className="py-2 px-4 text-left text-sm font-medium">Status</th>
                      <th className="py-2 px-4 text-left text-sm font-medium">Dokumente</th>
                      <th className="py-2 px-4 text-left text-sm font-medium">Gesamtgröße</th>
                      <th className="py-2 px-4 text-right text-sm font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {returnsWithDocuments.map(item => {
                      const documentCount = item.documents?.length || 0
                      const totalSize = item.documents?.reduce((sum, doc) => sum + doc.fileSize, 0) || 0
                      
                      return (
                        <tr key={item.id} className="hover:bg-muted/50">
                          <td className="py-2 px-4 text-sm font-medium">{getReturnTitle(item)}</td>
                          <td className="py-2 px-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-sm">{documentCount}</td>
                          <td className="py-2 px-4 text-sm">{formatFileSize(totalSize)}</td>
                          <td className="py-2 px-4 text-right">
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReturnId(item.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Dokumente anzeigen
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg bg-muted/10">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-medium mt-2">Keine Dokumente vorhanden</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Es wurden noch keine Dokumente zu Retouren hinzugefügt.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}