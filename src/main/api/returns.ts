import { Router, Request, Response } from 'express';
import { 
  getAllReturns, 
  getReturnsByOrderId,
  createReturn,
  updateReturnStatus, 
  addReturnNote, 
  updateReturn, 
  updateReturnWithProducts, 
  createDraftReturn,
  deleteDraftReturn,
  deleteReturnById,
  updateReturnWithStatus,
  createReturnFromOrder,
  getReturnById
} from '../database';
import { upload } from '../config/multer';
import { addDocument, getDocumentsByReturnId, deleteDocument } from '../database';
import sharp from 'sharp';
import path from 'path';
import { getUploadsPath } from '../database';

const router = Router();

// Get all returns (or returns by orderId if query param is present)
router.get('/', (req: Request, res: Response): void => {
  try {
    let returns;
    const orderId = req.query.orderId as string | undefined;

    if (orderId && !isNaN(Number(orderId))) {
      // Fetch returns by orderId
      returns = getReturnsByOrderId(Number(orderId)).map(row => ({
        ...row,
        id: String(row.id),
        products: JSON.parse(row.products || '[]'),
        notes: JSON.parse(row.notes || '[]'),
        documents: JSON.parse(row.documents || '[]'),
        customFields: JSON.parse(row.customFields || '{}'),
      }));
    } else {
      // Fetch all returns
      returns = getAllReturns().map(row => ({
        ...row,
        id: String(row.id),
        products: JSON.parse(row.products || '[]'),
        notes: JSON.parse(row.notes || '[]'),
        documents: JSON.parse(row.documents || '[]'),
        customFields: JSON.parse(row.customFields || '{}'),
      }));
    }
    
    res.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Abrufen der Retouren' });
  }
});

// Create a new return
router.post('/', (req: Request, res: Response): void => {
  try {
    if (!req.body.products?.length) {
      res.status(400).json({ error: 'Mindestens ein Produkt ist erforderlich.' });
      return;
    }

    const returnId = createReturn(req.body);
    const created = getAllReturns().find(r => r.id === returnId);
    
    if (!created) {
      throw new Error('Newly created return not found');
    }

    res.status(201).json({
      ...created,
      id: String(created.id),
      products: JSON.parse(created.products || '[]'),
      notes: JSON.parse(created.notes || '[]'),
      documents: JSON.parse(created.documents || '[]'),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Retoure' });
  }
});

// Create a new return from an existing order
router.post('/from-order', (req: Request, res: Response): void => {
  try {
    const { orderId, products: returnProducts, followUpAction, workflow_id, status } = req.body;

    if (!orderId || !returnProducts?.length || !followUpAction) {
      res.status(400).json({ error: 'orderId, products, and followUpAction are required.' });
      return;
    }

    const returnInput = {
      orderId: Number(orderId),
      products: returnProducts.map((p: { jtl_id: number; quantity: number; reason: string }) => ({
        jtl_id: p.jtl_id,
        quantity: p.quantity,
        reason: p.reason,
      })),
      followUpAction: followUpAction,
      workflow_id: workflow_id,
      status: status || 'Neu',
    };

    const createdReturn = createReturnFromOrder(returnInput);
    
    res.status(201).json(createdReturn);
  } catch (error) {
    console.error('Error creating return from order:', error);
    if (error instanceof Error && error.message.includes('not found')) {
       res.status(404).json({ error: error.message });
    } else {
       res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Retoure aus Bestellung' });
    }
  }
});

// Create draft return for the document upload process
router.post('/draft', (req: Request, res: Response): void => {
  try {
    // Create a draft return with minimal data
    const returnId = createDraftReturn();
    const created = getAllReturns().find(r => r.id === returnId);
    
    if (!created) {
      throw new Error('Newly created draft return not found');
    }

    res.status(201).json({
      ...created,
      id: String(created.id),
      products: JSON.parse(created.products || '[]'),
      notes: JSON.parse(created.notes || '[]'),
      documents: JSON.parse(created.documents || '[]'),
    });
  } catch (error) {
    console.error('Error creating draft return:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Retoure' });
  }
});

// Add note to a return
router.post('/:id/notes', (req: Request, res: Response): void => {
  try {
    if (!req.body.content || !req.body.author) {
      res.status(400).json({ error: 'Content und Author sind erforderlich' });
      return;
    }

    const result = addReturnNote(req.params.id, req.body.content, req.body.author);
    
    // Get the updated return with the new note
    const updatedReturn = getAllReturns().find(r => r.id.toString() === req.params.id);
    
    if (!updatedReturn) {
      res.status(404).json({ error: 'Retoure nicht gefunden' });
      return;
    }
    
    res.status(201).json({
      ...updatedReturn,
      id: String(updatedReturn.id),
      products: JSON.parse(updatedReturn.products || '[]'),
      notes: JSON.parse(updatedReturn.notes || '[]'),
      documents: JSON.parse(updatedReturn.documents || '[]'),
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Notiz' });
  }
});

// Update a return
router.patch('/:id', (req: Request, res: Response): void => {
  try {
    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'Keine Aktualisierungsfelder angegeben' });
      return;
    }
    
    // If there are products in the request, this might be a draft return being fully created
    if (req.body.products && Array.isArray(req.body.products)) {
      updateReturnWithProducts(req.params.id, req.body);
    } else {
      // Use the new combined update function
      updateReturnWithStatus(req.params.id, req.body);
    }

    // Return the updated return
    const updated = getAllReturns().find(r => r.id.toString() === req.params.id);
    
    if (!updated) {
      res.status(404).json({ error: 'Retoure nicht gefunden' });
      return;
    }
    
    res.json({
      ...updated,
      id: String(updated.id),
      products: JSON.parse(updated.products || '[]'),
      notes: JSON.parse(updated.notes || '[]'),
      documents: JSON.parse(updated.documents || '[]'),
    });
  } catch (error) {
    console.error('Error updating return:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Aktualisieren der Retoure' });
  }
});

// Delete draft return
router.delete('/:id/draft', (req: Request, res: Response): void => {
  try {
    console.log('Received delete draft request for return:', req.params.id);
    
    // Check if return exists and is a draft (no products)
    const returnToDelete = getAllReturns().find(r => r.id.toString() === req.params.id);
    
    if (!returnToDelete) {
      console.log('Return not found for deletion:', req.params.id);
      res.status(404).json({ error: 'Retoure nicht gefunden' });
      return;
    }
    
    console.log('Found return to delete:', {
      id: returnToDelete.id,
      products: JSON.parse(returnToDelete.products || '[]').length,
      status: returnToDelete.status
    });
    
    // Delete the return
    const result = deleteDraftReturn(req.params.id);
    console.log('Delete result:', result);
    
    if (result.changes > 0) {
      console.log('Successfully deleted draft return:', req.params.id);
      res.json({ deleted: true });
    } else {
      console.log('No changes made when deleting return:', req.params.id);
      res.status(404).json({ error: 'Retoure nicht gefunden' });
    }
  } catch (error) {
    console.error('Error deleting draft return:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Löschen der Retoure' });
  }
});

// Delete a return
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    console.log('Received delete request for return:', id);

    // Use getReturnById for efficiency and correctness
    const returnToDelete = getReturnById(id);
    if (!returnToDelete) {
      console.log('Return not found for deletion:', id);
      res.status(404).json({ error: 'Retoure nicht gefunden' });
      return;
    }

    const result = deleteReturnById(id);
    console.log('Delete result:', result);

    if (result.changes > 0) {
      console.log('Successfully deleted return:', id);
      res.status(200).json({ deleted: true });
    } else {
      console.log('No changes made when deleting return (concurrent modification?):', id);
      res.status(404).json({ error: 'Retoure nicht gefunden oder konnte nicht gelöscht werden' });
    }
  } catch (error) {
    console.error('Error deleting return:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Löschen der Retoure' });
  }
});

// Upload document for a return
router.post('/:id/documents', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Upload request params:', req.params);
    console.log('Upload request body:', req.body);
    console.log('Upload request file:', req.file);

    if (!req.file) {
      res.status(400).json({ error: 'Keine Datei hochgeladen' });
      return;
    }

    const returnId = req.params.id;
    console.log('returnId before database:', returnId);
    const { description } = req.body;
    const file = req.file;
    let thumbnailPath: string | undefined = undefined;

    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      const thumbFilename = `thumb-${path.basename(file.path)}`;
      const thumbPath = path.join(getUploadsPath(), thumbFilename);
      
      try {
        await sharp(file.path)
          .resize(200, 200, { fit: 'inside' })
          .toFile(thumbPath);
        thumbnailPath = thumbPath;
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        // Continue without thumbnail if generation fails
      }
    }

    // Add document to database
    const docId = addDocument({
      returnId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      description,
      thumbnailPath
    });

    // Get the newly added document
    const documents = getDocumentsByReturnId(returnId);
    const newDoc = documents.find(d => d.id === docId.toString());

    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Hochladen des Dokuments' });
  }
});

// Get documents for a return
router.get('/:id/documents', (req: Request, res: Response): void => {
  try {
    const documents = getDocumentsByReturnId(req.params.id);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Abrufen der Dokumente' });
  }
});

// Delete a document
router.delete('/:returnId/documents/:documentId', (req: Request, res: Response): void => {
  try {
    const { documentId } = req.params;
    const result = deleteDocument(documentId);
    if (result.changes > 0) {
      res.json({ deleted: true });
    } else {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Löschen des Dokuments' });
  }
});

// Export the setup function instead of the router directly
export function setupReturnsApi() {
  return router;
}

export default router;
