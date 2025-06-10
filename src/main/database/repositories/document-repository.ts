import { BaseRepository } from './base-repository';
import { ReturnDocument } from '../entities/core/ReturnDocument';
import { SupplierReturn } from '../entities/core/SupplierReturn';

/**
 * Repository for document metadata with file handling support
 */
export class DocumentRepository extends BaseRepository<ReturnDocument> {
  constructor() {
    super(ReturnDocument);
  }

  /**
   * Get documents for a specific return with metadata
   */
  async getDocumentsByReturnId(returnId: number): Promise<ReturnDocument[]> {
    return await this.find({
      where: { returnId },
      relations: ['return'],
      order: { uploadDate: 'DESC' }
    });
  }

  /**
   * Get document with full return information
   */
  async getDocumentWithReturn(id: number): Promise<ReturnDocument | null> {
    return await this.findOne({
      where: { id },
      relations: ['return']
    });
  }

  /**
   * Create document metadata entry with transaction safety
   */
  async createDocument(documentData: {
    returnId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    thumbnailPath?: string;
  }): Promise<ReturnDocument> {
    const document = this.typeormRepo.create({
      returnId: documentData.returnId,
      fileName: documentData.fileName,
      fileType: documentData.fileType,
      fileSize: documentData.fileSize,
      filePath: documentData.filePath,
      description: documentData.description,
      thumbnailPath: documentData.thumbnailPath
    });

    return await this.save(document);
  }

  /**
   * Get all documents with pagination
   */
  async getAllDocumentsPaginated(
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ReturnDocument[]; total: number }> {
    const [data, total] = await this.typeormRepo.findAndCount({
      relations: ['return'],
      order: { uploadDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  /**
   * Search documents by various criteria
   */
  async searchDocuments(criteria: {
    returnId?: number;
    fileName?: string;
    fileType?: string;
    description?: string;
    uploadDateFrom?: Date;
    uploadDateTo?: Date;
  }): Promise<ReturnDocument[]> {
    const query = this.typeormRepo.createQueryBuilder('document')
      .leftJoinAndSelect('document.return', 'return')
      .orderBy('document.uploadDate', 'DESC');

    if (criteria.returnId) {
      query.andWhere('document.returnId = :returnId', { returnId: criteria.returnId });
    }

    if (criteria.fileName) {
      query.andWhere('document.fileName LIKE :fileName', { 
        fileName: `%${criteria.fileName}%` 
      });
    }

    if (criteria.fileType) {
      query.andWhere('document.fileType = :fileType', { fileType: criteria.fileType });
    }

    if (criteria.description) {
      query.andWhere('document.description LIKE :description', { 
        description: `%${criteria.description}%` 
      });
    }

    if (criteria.uploadDateFrom) {
      query.andWhere('document.uploadDate >= :uploadDateFrom', { 
        uploadDateFrom: criteria.uploadDateFrom 
      });
    }

    if (criteria.uploadDateTo) {
      query.andWhere('document.uploadDate <= :uploadDateTo', { 
        uploadDateTo: criteria.uploadDateTo 
      });
    }

    return await query.getMany();
  }

  /**
   * Get documents by file type
   */
  async getDocumentsByType(fileType: string): Promise<ReturnDocument[]> {
    return await this.find({
      where: { fileType },
      relations: ['return'],
      order: { uploadDate: 'DESC' }
    });
  }

  /**
   * Get document statistics
   */
  async getDocumentStatistics(): Promise<{
    totalDocuments: number;
    totalFileSize: number;
    documentsByType: Record<string, number>;
    documentsWithThumbnails: number;
  }> {
    const totalDocuments = await this.count();
    
    // Get total file size
    const fileSizeResult = await this.typeormRepo.createQueryBuilder('document')
      .select('SUM(document.fileSize)', 'totalSize')
      .getRawOne();
    
    const totalFileSize = parseInt(fileSizeResult?.totalSize || '0');

    // Get documents by type
    const typeResults = await this.typeormRepo.createQueryBuilder('document')
      .select('document.fileType', 'fileType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('document.fileType')
      .getRawMany();

    const documentsByType: Record<string, number> = {};
    typeResults.forEach(result => {
      documentsByType[result.fileType] = parseInt(result.count);
    });

    // Count documents with thumbnails
    const documentsWithThumbnails = await this.count({
      where: {
        thumbnailPath: { $ne: null } as any
      }
    });

    return {
      totalDocuments,
      totalFileSize,
      documentsByType,
      documentsWithThumbnails
    };
  }

  /**
   * Get orphaned documents (documents without valid returns)
   */
  async getOrphanedDocuments(): Promise<ReturnDocument[]> {
    return await this.typeormRepo.createQueryBuilder('document')
      .leftJoin('document.return', 'return')
      .where('return.id IS NULL')
      .getMany();
  }

  /**
   * Clean up orphaned documents
   */
  async cleanupOrphanedDocuments(): Promise<number> {
    const orphaned = await this.getOrphanedDocuments();
    
    if (orphaned.length === 0) {
      return 0;
    }

    const ids = orphaned.map(doc => doc.id);
    const result = await this.typeormRepo.createQueryBuilder()
      .delete()
      .whereInIds(ids)
      .execute();

    return result.affected || 0;
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    id: number, 
    updates: {
      fileName?: string;
      description?: string;
      thumbnailPath?: string;
    }
  ): Promise<ReturnDocument | null> {
    await this.update(id, updates);
    return await this.findOne({ where: { id } });
  }

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit: number = 10): Promise<ReturnDocument[]> {
    return await this.find({
      relations: ['return'],
      order: { uploadDate: 'DESC' },
      take: limit
    });
  }

  /**
   * Get documents by return IDs (bulk operation)
   */
  async getDocumentsByReturnIds(returnIds: number[]): Promise<ReturnDocument[]> {
    if (returnIds.length === 0) {
      return [];
    }

    return await this.typeormRepo.createQueryBuilder('document')
      .leftJoinAndSelect('document.return', 'return')
      .where('document.returnId IN (:...returnIds)', { returnIds })
      .orderBy('document.uploadDate', 'DESC')
      .getMany();
  }
}