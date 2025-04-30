import db from './db';
import { Document } from '../../shared/types';

// Add document to database
export function addDocument(document: Partial<Document>) {
  const result = db.prepare(`
    INSERT INTO return_documents (returnId, fileName, fileType, fileSize, filePath, description, thumbnailPath)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    document.returnId,
    document.fileName,
    document.fileType,
    document.fileSize,
    document.filePath,
    document.description || null,
    document.thumbnailPath || null
  );
  
  return Number(result.lastInsertRowid);
}

// Get documents by return ID
export function getDocumentsByReturnId(returnId: string): Document[] {
  // Define an interface for raw database result
  interface DocumentRow {
    id: number;
    returnId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description: string | null;
    uploadDate: string;
    thumbnailPath: string | null;
  }
  
  const docs = db.prepare(`
    SELECT * FROM return_documents WHERE returnId = ?
  `).all(returnId) as DocumentRow[];
  
  // Map database results to Document interface
  return docs.map(doc => ({
    id: String(doc.id),
    returnId: String(doc.returnId),
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    filePath: doc.filePath,
    description: doc.description || undefined,
    uploadDate: doc.uploadDate,
    thumbnailPath: doc.thumbnailPath || undefined
  }));
}

// Get document by ID
export function getDocumentById(id: string): Document | null {
  interface DocumentRow {
    id: number;
    returnId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description: string | null;
    uploadDate: string;
    thumbnailPath: string | null;
  }
  
  const doc = db.prepare(`
    SELECT * FROM return_documents WHERE id = ?
  `).get(id) as DocumentRow | undefined;
  
  if (!doc) return null;
  
  return {
    id: String(doc.id),
    returnId: String(doc.returnId),
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    filePath: doc.filePath,
    description: doc.description || undefined,
    uploadDate: doc.uploadDate,
    thumbnailPath: doc.thumbnailPath || undefined
  };
}

// Delete a document
export function deleteDocument(documentId: string) {
  // Define an interface for the raw database result
  interface DocumentPathRow {
    filePath: string;
    thumbnailPath: string | null;
  }
  
  // Get file path before deleting from database
  const docResult = db.prepare('SELECT filePath, thumbnailPath FROM return_documents WHERE id = ?')
    .get(documentId) as DocumentPathRow | undefined;
  
  // Document deletion is now handled in returns.ts when deleting a draft return to avoid circular dependencies
  
  // Delete from database
  return db.prepare('DELETE FROM return_documents WHERE id = ?').run(documentId);
}

// Get all documents
export function getAllDocuments(): Document[] {
  interface DocumentRow {
    id: number;
    returnId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description: string | null;
    uploadDate: string;
    thumbnailPath: string | null;
  }
  
  const docs = db.prepare(`
    SELECT * FROM return_documents
    ORDER BY uploadDate DESC
  `).all() as DocumentRow[];
  
  return docs.map(doc => ({
    id: String(doc.id),
    returnId: String(doc.returnId),
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    filePath: doc.filePath,
    description: doc.description || undefined,
    uploadDate: doc.uploadDate,
    thumbnailPath: doc.thumbnailPath || undefined
  }));
}