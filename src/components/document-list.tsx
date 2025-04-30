import React from 'react'
import { FileText, Image, Plus, Search, SortAsc, SortDesc, FileType2, Filter, Upload, FolderSearch } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { Document } from '../shared/types'
import { DocumentViewer } from './document-viewer'
import { DocumentUpload } from './document-upload'

interface DocumentListProps {
  documents: Document[]
  returnId: string
  onDocumentUploaded: (document: Document) => void
  onDeleteDocument?: (documentId: string) => void
  apiUrl?: string
}

export function DocumentList({ 
  documents = [], 
  returnId,
  onDocumentUploaded,
  onDeleteDocument,
  apiUrl = 'http://localhost:3001'
}: DocumentListProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showUpload, setShowUpload] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'fileName' | 'uploadDate'>('uploadDate')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = React.useState<'all' | 'image' | 'pdf' | 'other'>('all')

  const toggleSort = (field: 'fileName' | 'uploadDate') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  const filteredDocuments = React.useMemo(() => {
    return documents
      .filter(doc => {
        if (searchTerm && !doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!doc.description || !doc.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false
        }
        
        if (filter === 'image' && !doc.fileType.startsWith('image/')) {
          return false
        } else if (filter === 'pdf' && doc.fileType !== 'application/pdf') {
          return false
        } else if (filter === 'other' && (doc.fileType.startsWith('image/') || doc.fileType === 'application/pdf')) {
          return false
        }
        
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'fileName') {
          return sortDirection === 'asc' 
            ? a.fileName.localeCompare(b.fileName)
            : b.fileName.localeCompare(a.fileName)
        } else {
          return sortDirection === 'asc'
            ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
            : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        }
      })
  }, [documents, searchTerm, sortBy, sortDirection, filter])

  const hasFilters = searchTerm || filter !== 'all'

  return (
    <div className="space-y-6">
      <div className="card-dashboard">
        <div className="p-6 border-b border-border/40">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Dokumente</h3>
                <p className="text-sm text-muted-foreground">
                  {documents.length} {documents.length === 1 ? 'Dokument' : 'Dokumente'} verfügbar
                </p>
              </div>
            </div>
            <Button
              variant={showUpload ? "secondary" : "outline"}
              onClick={() => setShowUpload(!showUpload)}
              className="shrink-0 group"
            >
              {showUpload ? (
                <>
                  <Upload className="h-4 w-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Upload aktiv
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Dokument hinzufügen
                </>
              )}
            </Button>
          </div>
        </div>

        {showUpload && (
          <div className="p-6 border-b border-border/40 bg-muted/50">
            <DocumentUpload
              returnId={returnId}
              onDocumentUploaded={(doc) => {
                onDocumentUploaded(doc)
                setShowUpload(false)
              }}
              apiUrl={apiUrl}
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-2 rounded-md bg-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                variant={sortBy === 'fileName' ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort('fileName')}
                className="gap-2"
              >
                Name
                {sortBy === 'fileName' && (
                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant={sortBy === 'uploadDate' ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort('uploadDate')}
                className="gap-2"
              >
                Datum
                {sortBy === 'uploadDate' && (
                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-7"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Alle
            </Button>
            <Button
              variant={filter === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('image')}
              className="h-7"
            >
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Bilder
            </Button>
            <Button
              variant={filter === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pdf')}
              className="h-7"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              PDFs
            </Button>
            <Button
              variant={filter === 'other' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('other')}
              className="h-7"
            >
              <FileType2 className="h-3.5 w-3.5 mr-1.5" />
              Andere
            </Button>
          </div>

          <div className="mt-6">
            {filteredDocuments.length === 0 ? (
              <div className="card-dashboard p-12 text-center">
                {documents.length === 0 ? (
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">Keine Dokumente vorhanden</p>
                      <p className="text-sm text-muted-foreground">
                        Fügen Sie das erste Dokument hinzu
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowUpload(true)}
                      className="group"
                    >
                      <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                      Dokument hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <FolderSearch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">Keine Dokumente gefunden</p>
                      <p className="text-sm text-muted-foreground">
                        Passen Sie Ihre Suchkriterien an
                      </p>
                    </div>
                    {hasFilters && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('')
                          setFilter('all')
                        }}
                      >
                        Filter zurücksetzen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocuments.map(document => (
                  <DocumentViewer
                    key={document.id}
                    document={document}
                    onDeleteDocument={
                      onDeleteDocument ? 
                        () => onDeleteDocument(document.id) : 
                        undefined
                    }
                    apiUrl={apiUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}