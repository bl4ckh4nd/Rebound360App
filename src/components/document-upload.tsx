import React from 'react'
import { Cloud, Image, FileText, File } from 'lucide-react'
import type { Document } from '../shared/types'
import { useUploadDocument } from '../renderer/hooks/useReturns.ts'

interface DocumentUploadProps {
  returnId: string
  onDocumentUploaded: (document: Document) => void
  apiUrl?: string
}

export function DocumentUpload({ returnId, onDocumentUploaded, apiUrl }: DocumentUploadProps) {
  const [description, setDescription] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const uploadMutation = useUploadDocument(returnId, apiUrl)

  const handleFileSelected = async (files: FileList | null) => {
    if (!files || !files[0]) return
    
    const file = files[0]
    setSelectedFile(file)
    
    try {
      const uploadedDoc = await uploadMutation.mutateAsync({
        file,
        description: description || undefined
      })
      
      onDocumentUploaded(uploadedDoc)
      setDescription('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    handleFileSelected(e.dataTransfer.files)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }
  
  const handleLabelClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <Cloud className="h-10 w-10 text-primary" />
    
    const type = selectedFile.type
    if (type.startsWith('image/')) {
      return <Image className="h-10 w-10 text-primary" />
    } else if (type === 'application/pdf') {
      return <FileText className="h-10 w-10 text-primary" />
    }
    return <File className="h-10 w-10 text-primary" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        className={`card-dashboard group transition-all duration-200 ${
          dragOver ? 'scale-[1.02] border-primary' : ''
        } ${uploadMutation.isPending ? 'bg-muted/50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            {getFileIcon()}
            
            <div className="text-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm font-medium hover:text-primary"
                onClick={handleLabelClick}
              >
                <span>Datei auswählen</span>
                <span className="text-muted-foreground"> oder hierher ziehen</span>
              </label>
              
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                ref={fileInputRef}
                onChange={(e) => handleFileSelected(e.target.files)}
                accept="image/*,.pdf"
              />
              
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, GIF oder PDF bis zu 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}

            {uploadMutation.isPending && (
              <div className="w-full max-w-xs">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {uploadMutation.isError && (
              <p className="text-sm text-destructive">
                {uploadMutation.error instanceof Error 
                  ? uploadMutation.error.message 
                  : 'Fehler beim Hochladen'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Optionale Beschreibung..."
          className="flex-1 input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploadMutation.isPending}
        />
      </div>
    </div>
  )
}