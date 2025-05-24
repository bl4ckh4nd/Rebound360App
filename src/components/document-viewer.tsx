import React from 'react'
import { FileText, Image, File, Download, Trash2, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import type { Document } from '../shared/types'

interface DocumentViewerProps {
  document: Document
  onDeleteDocument?: (document: Document) => void
  apiUrl?: string
}

export function DocumentViewer({ 
  document, 
  onDeleteDocument,
  apiUrl = 'http://localhost:3001' 
}: DocumentViewerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false)
  const isImage = document.fileType.startsWith('image/')
  const isPDF = document.fileType === 'application/pdf'
  
  const fileSizeFormatted = () => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (document.fileSize === 0) return '0 Byte'
    const i = Math.floor(Math.log(document.fileSize) / Math.log(1024))
    return `${parseFloat((document.fileSize / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  const getDocumentUrl = () => {
    const filePath = document.filePath
    const fileName = window.electronPath.basename(filePath)
    return `${apiUrl}/uploads/${fileName}`
  }

  const documentUrl = getDocumentUrl()
  const thumbnailUrl = document.thumbnailPath 
    ? `${apiUrl}/uploads/${window.electronPath.basename(document.thumbnailPath)}`
    : null

  const handleDownload = () => {
    const link = window.document.createElement('a')
    link.href = documentUrl
    link.setAttribute('download', document.fileName)
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDeleteDocument?.(document)
      setIsConfirmingDelete(false)
      setIsOpen(false)
    } else {
      setIsConfirmingDelete(true)
    }
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const rotateImage = () => setRotation(prev => (prev + 90) % 360)

  return (
    <>
      <div 
        className="card-dashboard group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/20"
        onClick={() => setIsOpen(true)}
      >
        {isImage && thumbnailUrl ? (
          <div className="aspect-square flex items-center justify-center overflow-hidden bg-background">
            <img 
              src={thumbnailUrl} 
              alt={document.fileName} 
              className="object-contain max-h-full max-w-full transition-transform group-hover:scale-105"
            />
          </div>
        ) : isPDF ? (
          <div className="aspect-square flex items-center justify-center bg-primary/5">
            <FileText className="h-12 w-12 text-primary transition-transform group-hover:scale-110" />
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center bg-muted/30">
            <File className="h-12 w-12 text-muted-foreground transition-transform group-hover:scale-110" />
          </div>
        )}
        
        <div className="p-3 text-xs truncate border-t border-border/40 bg-card">
          <p className="font-medium">{document.fileName}</p>
          <p className="text-muted-foreground mt-0.5">{fileSizeFormatted()}</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b border-border/40">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isImage ? (
                  <Image className="h-5 w-5 text-primary" />
                ) : isPDF ? (
                  <FileText className="h-5 w-5 text-primary" />
                ) : (
                  <File className="h-5 w-5 text-primary" />
                )}
                <span className="truncate">{document.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {isImage && (
                  <>
                    <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={rotateImage} className="h-8 w-8">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownload} 
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {onDeleteDocument && (
                  <Button 
                    variant={isConfirmingDelete ? "destructive" : "outline"}
                    size="icon"
                    onClick={handleDelete}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto flex-1 bg-background/50">
            {isImage ? (
              <div className="overflow-auto max-w-full max-h-[70vh] flex items-center justify-center p-6">
                <img 
                  src={documentUrl} 
                  alt={document.fileName}
                  style={{ 
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                  className="max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : isPDF ? (
              <iframe 
                src={`${documentUrl}#toolbar=0`} 
                className="w-full h-[70vh] border-0"
                title={document.fileName}
              ></iframe>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Vorschau nicht verfügbar</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Diese Datei kann nicht direkt angezeigt werden
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  className="group"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Datei herunterladen
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border/40 bg-muted/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Größe: {fileSizeFormatted()}</span>
                <span>•</span>
                <span>Typ: {document.fileType}</span>
              </div>
              {document.description && (
                <span className="truncate max-w-md px-4">{document.description}</span>
              )}
              <span>
                Hochgeladen: {new Date(document.uploadDate).toLocaleDateString('de-DE')}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}