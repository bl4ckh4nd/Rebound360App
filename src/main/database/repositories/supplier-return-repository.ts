import { BaseRepository } from './base-repository';
import { SupplierReturn } from '../entities/core/SupplierReturn';
import { ReturnProduct } from '../entities/core/ReturnProduct';
import { ReturnNote } from '../entities/core/ReturnNote';
import { ReturnDocument } from '../entities/core/ReturnDocument';
import { FollowUpAction } from '../entities/types';
import { In } from 'typeorm';

interface ReturnWithAggregatedData {
  id: number;
  orderNumber: string | null;
  status: string;
  followUpAction: FollowUpAction;
  products: string; // JSON string
  notes: string; // JSON string
  documents: string; // JSON string
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface ReturnFilters {
  status?: string | string[];
  followUpAction?: FollowUpAction | FollowUpAction[];
  orderNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  workflowId?: string;
  limit?: number;
  offset?: number;
}

interface CreateReturnDTO {
  orderNumber?: string;
  status: string;
  followUpAction: FollowUpAction;
  workflowId?: string;
  customFields?: Record<string, any>;
  products?: Array<{
    productName: string;
    quantity: number;
    reason: string;
    serialNumber?: string;
    price?: number;
    sku?: string;
  }>;
}

interface CreateNoteDTO {
  content: string;
  author: string;
}

interface UpdateReturnDTO {
  status?: string;
  followUpAction?: FollowUpAction;
  workflowId?: string;
  customFields?: Record<string, any>;
  commissioningDate?: string;
  shippingDate?: string;
  creditDate?: string;
  reconciliationDate?: string;
  creditNoteNumber?: string;
  creditAmount?: number;
  creditNoteStatus?: string;
  originalInvoiceNumber?: string;
  creditorNumber?: string;
  reconciliationInvoiceNumber?: string;
}

export class SupplierReturnRepository extends BaseRepository<SupplierReturn> {
  constructor() {
    super(SupplierReturn);
  }

  /**
   * Use TypeORM for simple queries with relations
   */
  async findByStatus(status: string): Promise<SupplierReturn[]> {
    return this.findAll({
      where: { status },
      relations: ['products', 'notes', 'documents', 'workflow'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Use TypeORM for finding returns by workflow
   */
  async findByWorkflow(workflowId: string): Promise<SupplierReturn[]> {
    return this.findAll({
      where: { workflowId },
      relations: ['products', 'notes'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Create return with products using TypeORM transactions
   */
  async createWithProducts(data: {
    orderNumber?: string;
    status: string;
    followUpAction: FollowUpAction;
    workflowId?: string;
    customFields?: Record<string, any>;
    products: Array<{
      productName: string;
      quantity: number;
      reason: string;
      serialNumber?: string;
    }>;
  }): Promise<SupplierReturn> {
    const dataSource = this.typeormRepo.manager.connection;
    
    return dataSource.transaction(async manager => {
      // Create return
      const returnEntity = manager.create(SupplierReturn, {
        orderNumber: data.orderNumber,
        status: data.status,
        followUpAction: data.followUpAction,
        workflowId: data.workflowId,
        customFields: data.customFields || {}
      } as any);
      
      const savedReturn = await manager.save(returnEntity);
      
      // Create products
      if (data.products && data.products.length > 0) {
        const products = data.products.map(product => 
          manager.create(ReturnProduct, {
            ...product,
            returnId: savedReturn.id
          })
        );
        await manager.save(products);
      }
      
      return savedReturn;
    });
  }

  /**
   * Use better-sqlite3 for complex aggregated queries
   * This matches the existing implementation's performance
   */
  async getReturnsWithAggregatedData(): Promise<any[]> {
    const query = `
      SELECT 
        r.*,
        json_group_array(
          CASE 
            WHEN p.id IS NOT NULL THEN 
              json_object(
                'id', p.id,
                'productName', p.productName,
                'quantity', p.quantity,
                'reason', p.reason,
                'serialNumber', p.serialNumber
              )
            ELSE NULL
          END
        ) FILTER (WHERE p.id IS NOT NULL) as products,
        json_group_array(
          CASE 
            WHEN n.id IS NOT NULL THEN 
              json_object(
                'id', n.id,
                'content', n.content,
                'author', n.author,
                'createdAt', n.createdAt
              )
            ELSE NULL
          END
        ) FILTER (WHERE n.id IS NOT NULL) as notes,
        json_group_array(
          CASE 
            WHEN d.id IS NOT NULL THEN 
              json_object(
                'id', d.id,
                'fileName', d.fileName,
                'fileType', d.fileType,
                'fileSize', d.fileSize,
                'uploadDate', d.uploadDate
              )
            ELSE NULL
          END
        ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM supplier_returns r
      LEFT JOIN return_products p ON r.id = p.returnId
      LEFT JOIN return_notes n ON r.id = n.returnId
      LEFT JOIN return_documents d ON r.id = d.returnId
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `;
    
    const results = this.executeRawQuery<ReturnWithAggregatedData>(query);
    
    // Parse JSON fields
    return results.map(row => ({
      ...row,
      products: this.parseJson(row.products, []),
      notes: this.parseJson(row.notes, []),
      documents: this.parseJson(row.documents, []),
      customFields: this.parseJson(row.customFields as string, {})
    }));
  }

  /**
   * Use better-sqlite3 for complex status update with validation
   */
  async updateStatusWithValidation(
    returnId: number, 
    newStatus: string, 
    requiredFields: Record<string, any>
  ): Promise<void> {
    this.executeTransaction(() => {
      // Update status
      this.executeRawCommand(
        'UPDATE supplier_returns SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, returnId]
      );
      
      // Update custom fields if provided
      if (requiredFields && Object.keys(requiredFields).length > 0) {
        const currentReturn = this.executeRawQuerySingle<{ customFields: string }>(
          'SELECT customFields FROM supplier_returns WHERE id = ?',
          [returnId]
        );
        
        if (currentReturn) {
          const customFields = this.parseJson(currentReturn.customFields, {});
          const updatedFields = { ...customFields, ...requiredFields };
          
          this.executeRawCommand(
            'UPDATE supplier_returns SET customFields = ? WHERE id = ?',
            [this.stringifyJson(updatedFields), returnId]
          );
        }
      }
      
      // Add status change note
      this.executeRawCommand(
        'INSERT INTO return_notes (returnId, content, author) VALUES (?, ?, ?)',
        [returnId, `Status changed to: ${newStatus}`, 'System']
      );
    });
  }

  /**
   * Get return statistics using raw SQL for performance
   */
  async getStatistics(): Promise<{
    totalReturns: number;
    byStatus: Record<string, number>;
    byFollowUpAction: Record<string, number>;
  }> {
    const totalResult = this.executeRawQuerySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM supplier_returns'
    );
    
    const byStatusResults = this.executeRawQuery<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM supplier_returns GROUP BY status'
    );
    
    const byActionResults = this.executeRawQuery<{ followUpAction: string; count: number }>(
      'SELECT followUpAction, COUNT(*) as count FROM supplier_returns GROUP BY followUpAction'
    );
    
    return {
      totalReturns: totalResult?.count || 0,
      byStatus: byStatusResults.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {} as Record<string, number>),
      byFollowUpAction: byActionResults.reduce((acc, row) => {
        acc[row.followUpAction] = row.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // ============================================
  // PHASE 1: Enhanced CRUD Operations
  // ============================================

  /**
   * Get all returns with optional filtering (TypeORM)
   */
  async getAllReturns(filters?: ReturnFilters): Promise<SupplierReturn[]> {
    const whereConditions: any = {};
    
    if (filters?.status) {
      whereConditions.status = Array.isArray(filters.status) 
        ? In(filters.status) 
        : filters.status;
    }
    
    if (filters?.followUpAction) {
      whereConditions.followUpAction = Array.isArray(filters.followUpAction)
        ? In(filters.followUpAction)
        : filters.followUpAction;
    }
    
    if (filters?.orderNumber) {
      whereConditions.orderNumber = filters.orderNumber;
    }
    
    if (filters?.workflowId) {
      whereConditions.workflowId = filters.workflowId;
    }

    return this.findAll({
      where: whereConditions,
      relations: ['products', 'notes', 'documents'],
      order: { createdAt: 'DESC' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0
    });
  }

  /**
   * Get single return by ID with all relations (TypeORM)
   */
  async getReturnById(id: number): Promise<SupplierReturn | null> {
    return this.findOne({
      where: { id },
      relations: ['products', 'notes', 'documents', 'workflow']
    });
  }

  /**
   * Create a new return (TypeORM with transaction)
   */
  async createReturn(data: CreateReturnDTO): Promise<SupplierReturn> {
    const dataSource = this.typeormRepo.manager.connection;
    
    return dataSource.transaction(async manager => {
      // Create return entity
      const returnEntity = manager.create(SupplierReturn, {
        orderNumber: data.orderNumber,
        status: data.status,
        followUpAction: data.followUpAction,
        workflowId: data.workflowId,
        customFields: data.customFields || {}
      } as any);
      
      const savedReturn = await manager.save(returnEntity);
      
      // Create products if provided
      if (data.products && data.products.length > 0) {
        const products = data.products.map(product => 
          manager.create(ReturnProduct, {
            ...product,
            returnId: savedReturn.id
          })
        );
        await manager.save(products);
        savedReturn.products = products;
      }
      
      // Add creation note
      const creationNote = manager.create(ReturnNote, {
        returnId: savedReturn.id,
        content: `Return created with status: ${data.status}`,
        author: 'System'
      });
      await manager.save(creationNote);
      
      return savedReturn;
    });
  }

  /**
   * Update return (TypeORM)
   */
  async updateReturn(id: number, data: UpdateReturnDTO): Promise<SupplierReturn | null> {
    const existingReturn = await this.findById(id);
    if (!existingReturn) {
      return null;
    }

    // Merge custom fields
    if (data.customFields) {
      data.customFields = { ...existingReturn.customFields, ...data.customFields };
    }

    await this.typeormRepo.update(id, data as any);
    
    // Return updated entity with relations
    return this.getReturnById(id);
  }

  /**
   * Delete return (TypeORM with cascade)
   */
  async deleteReturn(id: number): Promise<boolean> {
    const result = await this.typeormRepo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Add note to return (TypeORM)
   */
  async addNote(returnId: number, noteData: CreateNoteDTO): Promise<ReturnNote> {
    const noteRepo = this.typeormRepo.manager.getRepository(ReturnNote);
    
    const note = noteRepo.create({
      returnId,
      content: noteData.content,
      author: noteData.author
    });
    
    return noteRepo.save(note);
  }

  /**
   * Get notes for return (TypeORM)
   */
  async getReturnNotes(returnId: number): Promise<ReturnNote[]> {
    const noteRepo = this.typeormRepo.manager.getRepository(ReturnNote);
    
    return noteRepo.find({
      where: { returnId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Delete note (TypeORM)
   */
  async deleteNote(noteId: number): Promise<boolean> {
    const noteRepo = this.typeormRepo.manager.getRepository(ReturnNote);
    const result = await noteRepo.delete(noteId);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get documents for return (TypeORM)
   */
  async getReturnDocuments(returnId: number): Promise<ReturnDocument[]> {
    const docRepo = this.typeormRepo.manager.getRepository(ReturnDocument);
    
    return docRepo.find({
      where: { returnId },
      order: { uploadDate: 'DESC' }
    });
  }

  /**
   * Add document to return (TypeORM)
   */
  async addDocument(returnId: number, documentData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    thumbnailPath?: string;
  }): Promise<ReturnDocument> {
    const docRepo = this.typeormRepo.manager.getRepository(ReturnDocument);
    
    const document = docRepo.create({
      returnId,
      fileName: documentData.fileName,
      fileType: documentData.fileType,
      fileSize: documentData.fileSize,
      filePath: documentData.filePath,
      description: documentData.description,
      thumbnailPath: documentData.thumbnailPath
    });
    
    return docRepo.save(document);
  }

  /**
   * Delete document (TypeORM)
   */
  async deleteDocument(documentId: number): Promise<boolean> {
    const docRepo = this.typeormRepo.manager.getRepository(ReturnDocument);
    const result = await docRepo.delete(documentId);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get returns count by filter (TypeORM)
   */
  async getReturnsCount(filters?: ReturnFilters): Promise<number> {
    const whereConditions: any = {};
    
    if (filters?.status) {
      whereConditions.status = Array.isArray(filters.status) 
        ? In(filters.status) 
        : filters.status;
    }
    
    if (filters?.followUpAction) {
      whereConditions.followUpAction = Array.isArray(filters.followUpAction)
        ? In(filters.followUpAction)
        : filters.followUpAction;
    }
    
    if (filters?.orderNumber) {
      whereConditions.orderNumber = filters.orderNumber;
    }
    
    if (filters?.workflowId) {
      whereConditions.workflowId = filters.workflowId;
    }

    return this.typeormRepo.count({ where: whereConditions });
  }

  /**
   * Search returns by multiple criteria (TypeORM with QueryBuilder)
   */
  async searchReturns(searchTerm: string, filters?: ReturnFilters): Promise<SupplierReturn[]> {
    const queryBuilder = this.typeormRepo.createQueryBuilder('return')
      .leftJoinAndSelect('return.products', 'products')
      .leftJoinAndSelect('return.notes', 'notes')
      .leftJoinAndSelect('return.documents', 'documents');

    // Add search conditions
    queryBuilder.where(
      '(return.orderNumber LIKE :search OR return.status LIKE :search OR return.creditNoteNumber LIKE :search)',
      { search: `%${searchTerm}%` }
    );

    // Add filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        queryBuilder.andWhere('return.status IN (:...statuses)', { statuses: filters.status });
      } else {
        queryBuilder.andWhere('return.status = :status', { status: filters.status });
      }
    }

    if (filters?.followUpAction) {
      if (Array.isArray(filters.followUpAction)) {
        queryBuilder.andWhere('return.followUpAction IN (:...actions)', { actions: filters.followUpAction });
      } else {
        queryBuilder.andWhere('return.followUpAction = :action', { action: filters.followUpAction });
      }
    }

    // Add ordering and pagination
    queryBuilder.orderBy('return.createdAt', 'DESC');
    
    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }
    
    if (filters?.offset) {
      queryBuilder.skip(filters.offset);
    }

    return queryBuilder.getMany();
  }
}