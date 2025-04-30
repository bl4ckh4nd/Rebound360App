import { Router, Request, Response } from 'express';
import fs from 'fs';
import { getDocumentById } from '../database';

const router = Router();

// Get document file by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const document = getDocumentById(req.params.id);
    
    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    if (!fs.existsSync(document.filePath)) {
      res.status(404).json({ error: 'Datei nicht gefunden' });
      return;
    }

    res.sendFile(document.filePath);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Abrufen des Dokuments' });
  }
});

// Get document thumbnail by ID
router.get('/:id/thumbnail', (req: Request, res: Response): void => {
  try {
    const document = getDocumentById(req.params.id);
    
    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    if (!document.thumbnailPath || !fs.existsSync(document.thumbnailPath)) {
      res.status(404).json({ error: 'Thumbnail nicht gefunden' });
      return;
    }

    res.sendFile(document.thumbnailPath);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Abrufen des Thumbnails' });
  }
});

export function setupDocumentsApi() {
  return router;
}

export default router;