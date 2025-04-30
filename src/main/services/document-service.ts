import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { getUploadsPath } from '../database';

/**
 * Service for document-related operations like thumbnail generation
 */
export class DocumentService {
  /**
   * Generate a thumbnail for an image file
   * @param filePath Path to the original image file
   * @param width Thumbnail width
   * @param height Thumbnail height
   * @returns Path to the generated thumbnail or undefined if failed
   */
  static async generateThumbnail(filePath: string, width = 200, height = 200): Promise<string | undefined> {
    try {
      const thumbFilename = `thumb-${path.basename(filePath)}`;
      const thumbPath = path.join(getUploadsPath(), thumbFilename);
      
      await sharp(filePath)
        .resize(width, height, { fit: 'inside' })
        .toFile(thumbPath);
        
      return thumbPath;
    } catch (err) {
      console.error('Error generating thumbnail:', err);
      return undefined;
    }
  }
  
  /**
   * Delete file and its thumbnail if exists
   * @param filePath Path to the file to delete
   * @param thumbnailPath Path to the thumbnail to delete
   */
  static deleteFiles(filePath?: string, thumbnailPath?: string): void {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  }
  
  /**
   * Check if a file is an image
   * @param mimeType The MIME type of the file
   * @returns boolean indicating if the file is an image
   */
  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}