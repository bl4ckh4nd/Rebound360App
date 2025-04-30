import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUploadsPath } from '../database';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadsDir = getUploadsPath();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images and PDFs
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF and PDF are allowed.'));
    }
  }
});