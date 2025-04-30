import express, { Express } from 'express';
import cors from 'cors';
import { getUploadsPath } from '../database';

export function configureExpressApp(): Express {
  const expressApp = express();
  
  // Configure CORS to allow requests from the frontend
  expressApp.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'app://.'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
  }));
  
  // Parse JSON request bodies
  expressApp.use(express.json());
  
  // Serve uploaded files statically
  expressApp.use('/uploads', express.static(getUploadsPath()));
  
  return expressApp;
}