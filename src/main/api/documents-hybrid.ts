import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import path from 'path';
import fs from 'fs';
import { getDocumentRepository } from '../database/repositories';
import * as documentsDb from '../database/documents';
import { useTypeORMForDocuments, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';
import { DocumentService } from '../services/document-service';
import { getUploadsPath } from '../database/db';

// TypeORM entity types
import { ReturnDocument as ReturnDocumentEntity } from '../database/entities/core/ReturnDocument';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface IdParams extends ParamsDictionary {
  id: string;
}

interface ReturnIdParams extends ParamsDictionary {
  returnId: string;
}

interface DocumentIdParams extends ParamsDictionary {
  returnId: string;
  documentId: string;
}

/**
 * Helper function to transform TypeORM entity to response format
 */
function transformDocumentEntity(entity: ReturnDocumentEntity): any {
  return {
    id: entity.id,
    returnId: entity.returnId,
    fileName: entity.fileName,
    fileType: entity.fileType,
    fileSize: entity.fileSize,
    filePath: entity.filePath,
    description: entity.description,
    thumbnailPath: entity.thumbnailPath,
    uploadDate: entity.uploadDate?.toISOString(),
    return: entity.return ? {
      id: entity.return.id,
      orderNumber: entity.return.orderNumber,
      status: entity.return.status
    } : undefined
  };
}

/**
 * Hybrid documents API that can use TypeORM or fallback to better-sqlite3
 * Handles document metadata operations with file system coordination
 */
const router = Router();

// Health check endpoint (must come before /:id route)
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const repo = getDocumentRepository();
        const stats = await repo.getDocumentStatistics();
        
        return {
          status: 'healthy',
          implementation: 'typeorm',
          totalDocuments: stats.totalDocuments,
          totalFileSize: stats.totalFileSize,
          documentsWithThumbnails: stats.documentsWithThumbnails,
          uploadsPath: getUploadsPath(),
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      () => {
        const documents = documentsDb.getAllDocuments();
        const totalFileSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        const documentsWithThumbnails = documents.filter(doc => doc.thumbnailPath).length;
        
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          totalDocuments: documents.length,
          totalFileSize,
          documentsWithThumbnails,
          uploadsPath: getUploadsPath(),
          timestamp: new Date().toISOString()
        };
      },
      'documents-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in documents health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

// GET /api/documents/search - Search documents with criteria
router.get('/search', (async (req, res) => {
  try {
    const {
      returnId,
      fileName,
      fileType,
      description,
      uploadDateFrom,
      uploadDateTo
    } = req.query;

    if (!useTypeORMForDocuments()) {
      res.status(501).json({ 
        error: 'Document search requires TypeORM to be enabled' 
      });
      return;
    }

    const repo = getDocumentRepository();
    const documents = await repo.searchDocuments({
      returnId: returnId ? parseInt(returnId as string) : undefined,
      fileName: fileName as string,
      fileType: fileType as string,
      description: description as string,
      uploadDateFrom: uploadDateFrom ? new Date(uploadDateFrom as string) : undefined,
      uploadDateTo: uploadDateTo ? new Date(uploadDateTo as string) : undefined
    });

    const result = documents.map(transformDocumentEntity);

    res.json({ data: result });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
}) as RequestHandler);

// GET /api/documents/statistics - Get document statistics (TypeORM-enhanced feature)
router.get('/statistics', (async (req, res) => {
  try {
    if (!useTypeORMForDocuments()) {
      res.status(501).json({ 
        error: 'Document statistics require TypeORM to be enabled' 
      });
      return;
    }

    const repo = getDocumentRepository();
    const stats = await repo.getDocumentStatistics();

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
}) as RequestHandler);

// GET /api/documents/recent - Get recent documents (TypeORM-enhanced feature)
router.get('/recent', (async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    if (!useTypeORMForDocuments()) {
      res.status(501).json({ 
        error: 'Recent documents require TypeORM to be enabled' 
      });
      return;
    }

    const repo = getDocumentRepository();
    const documents = await repo.getRecentDocuments(limitNum);
    const result = documents.map(transformDocumentEntity);

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    res.status(500).json({ error: 'Failed to fetch recent documents' });
  }
}) as RequestHandler);

// POST /api/documents/cleanup-orphaned - Clean up orphaned documents (Admin feature)
router.post('/cleanup-orphaned', (async (req, res) => {
  try {
    if (!useTypeORMForDocuments()) {
      res.status(501).json({ 
        error: 'Document cleanup requires TypeORM to be enabled' 
      });
      return;
    }

    const repo = getDocumentRepository();
    const deletedCount = await repo.cleanupOrphanedDocuments();

    res.json({ 
      data: { 
        message: `Cleaned up ${deletedCount} orphaned documents`,
        deletedCount 
      }
    });
  } catch (error) {
    console.error('Error cleaning up orphaned documents:', error);
    res.status(500).json({ error: 'Failed to cleanup orphaned documents' });
  }
}) as RequestHandler);

// GET /api/documents/:id - Get document file by ID
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      res.status(400).json({ error: 'Invalid document ID' });
      return;
    }

    const document = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getDocumentRepository();
        const entity = await repo.findOne({ where: { id: documentId } });
        return entity ? transformDocumentEntity(entity) : null;
      },
      // Fallback to original implementation
      () => documentsDb.getDocumentById(id),
      'get-document-by-id'
    );

    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      console.error(`File not found: ${document.filePath}`);
      res.status(404).json({ error: 'Datei nicht gefunden' });
      return;
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);

    // Send file
    res.sendFile(path.resolve(document.filePath));

    if (enablePerformanceLogging()) {
      const method = useTypeORMForDocuments() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📄 Document served using ${method}: ${document.fileName}`);
    }
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler<IdParams>);

// GET /api/documents/:id/thumbnail - Get document thumbnail by ID
router.get('/:id/thumbnail', (async (req, res) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      res.status(400).json({ error: 'Invalid document ID' });
      return;
    }

    const document = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getDocumentRepository();
        const entity = await repo.findOne({ where: { id: documentId } });
        return entity ? transformDocumentEntity(entity) : null;
      },
      // Fallback to original implementation
      () => documentsDb.getDocumentById(id),
      'get-document-thumbnail'
    );

    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    if (!document.thumbnailPath) {
      res.status(404).json({ error: 'Thumbnail nicht verfügbar' });
      return;
    }

    // Check if thumbnail exists
    if (!fs.existsSync(document.thumbnailPath)) {
      console.error(`Thumbnail not found: ${document.thumbnailPath}`);
      res.status(404).json({ error: 'Thumbnail nicht gefunden' });
      return;
    }

    // Set appropriate headers for thumbnail
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="thumb_${document.fileName}"`);

    // Send thumbnail
    res.sendFile(path.resolve(document.thumbnailPath));
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler<IdParams>);

// GET /api/documents/return/:returnId - Get all documents for a return
router.get('/return/:returnId', (async (req, res) => {
  try {
    const { returnId } = req.params;
    const returnIdNum = parseInt(returnId);

    if (isNaN(returnIdNum)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    const documents = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getDocumentRepository();
        const entities = await repo.getDocumentsByReturnId(returnIdNum);
        return entities.map(transformDocumentEntity);
      },
      // Fallback to original implementation
      () => documentsDb.getDocumentsByReturnId(returnId),
      'get-documents-by-return-id'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForDocuments() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📄 Documents fetched using ${method}, count: ${documents.length}`);
    }

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}) as RequestHandler<ReturnIdParams>);

// DELETE /api/documents/return/:returnId/document/:documentId - Delete a document
router.delete('/return/:returnId/document/:documentId', (async (req, res) => {
  try {
    const { returnId, documentId } = req.params;
    const docId = parseInt(documentId);

    if (isNaN(docId)) {
      res.status(400).json({ error: 'Invalid document ID' });
      return;
    }

    // First get the document to get file paths for cleanup
    const document = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getDocumentRepository();
        const entity = await repo.findOne({ where: { id: docId } });
        return entity ? transformDocumentEntity(entity) : null;
      },
      // Fallback to original implementation
      () => documentsDb.getDocumentById(documentId),
      'get-document-for-deletion'
    );

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete from database first
    const deleteResult = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getDocumentRepository();
        const result = await repo.delete(docId);
        return (result.affected || 0) > 0;
      },
      // Fallback to original implementation
      () => documentsDb.deleteDocument(documentId),
      'delete-document-db'
    );

    if (!deleteResult) {
      res.status(500).json({ error: 'Failed to delete document from database' });
      return;
    }

    // Clean up files from filesystem (both implementations do this)
    try {
      await DocumentService.deleteFiles(document.filePath, document.thumbnailPath);
    } catch (fileError) {
      console.warn('Failed to delete document files:', fileError);
      // Don't fail the operation if file cleanup fails
    }

    if (enablePerformanceLogging()) {
      const method = useTypeORMForDocuments() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📄 Document deleted using ${method}: ${document.fileName}`);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}) as RequestHandler<DocumentIdParams>);


export default router;