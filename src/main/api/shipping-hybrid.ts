import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { shippingDb } from '../database/shipping';
import { getShippingRepository, getShippingTrackingRepository } from '../database/repositories';
import { dhlService } from '../services/dhl-service';
import { 
  setDHLCredentials, 
  getDHLClientId, 
  getDHLClientSecret, 
  deleteDHLCredentials 
} from '../services/credentials';
import { useTypeORMForShipping, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';
import type { DHLShipmentRequest, DHLShipmentAddress } from '../services/dhl-service';

// TypeORM entity types
import { ShippingLabel as ShippingLabelEntity } from '../database/entities/shipping/ShippingLabel';
import { ShippingTracking as ShippingTrackingEntity } from '../database/entities/shipping/ShippingTracking';

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

interface TrackingParams extends ParamsDictionary { 
  trackingNumber: string;
}

interface CreateShippingLabelRequest {
  returnId: number;
  shipper: DHLShipmentAddress;
  consignee: DHLShipmentAddress;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  serviceType?: string;
}

interface DHLCredentialsRequest {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  accountNumber?: string;
}

/**
 * Helper function to transform TypeORM entity to response format
 */
function transformShippingLabelEntity(entity: ShippingLabelEntity): any {
  return {
    id: entity.id,
    returnId: entity.returnId,
    shipmentNumber: entity.shipmentNumber,
    trackingNumber: entity.trackingNumber,
    routingCode: entity.routingCode,
    labelData: entity.labelData,
    labelFilename: entity.labelFilename,
    shipper: {
      name: entity.shipperName,
      address: entity.shipperAddress,
      city: entity.shipperCity,
      postalCode: entity.shipperPostalCode,
      country: entity.shipperCountry,
      phone: entity.shipperPhone,
      email: entity.shipperEmail
    },
    consignee: {
      name: entity.consigneeName,
      address: entity.consigneeAddress,
      city: entity.consigneeCity,
      postalCode: entity.consigneePostalCode,
      country: entity.consigneeCountry,
      phone: entity.consigneePhone,
      email: entity.consigneeEmail
    },
    serviceType: entity.serviceType,
    weight: entity.weight,
    length: entity.length,
    width: entity.width,
    height: entity.height,
    status: entity.status,
    createdAt: entity.createdAt?.toISOString(),
    updatedAt: entity.updatedAt?.toISOString(),
    trackingEvents: entity.trackingEvents?.map(event => ({
      id: event.id,
      eventType: event.eventType,
      status: event.status,
      location: event.location,
      timestamp: event.timestamp?.toISOString(),
      description: event.description,
      eventDetails: event.eventDetails,
      createdAt: event.createdAt?.toISOString()
    })) || []
  };
}

/**
 * Hybrid shipping API that can use TypeORM or fallback to better-sqlite3
 * Handles shipping labels, tracking, and DHL integration
 */
const router = Router();

// Create shipping label with DHL integration
router.post('/labels', (async (req, res) => {
  try {
    const {
      returnId,
      shipper,
      consignee,
      weight,
      length,
      width,
      height,
      serviceType = 'V01PAK'
    }: CreateShippingLabelRequest = req.body;

    if (!returnId || !shipper || !consignee || !weight) {
      res.status(400).json({
        error: 'Missing required fields: returnId, shipper, consignee, weight'
      });
      return;
    }

    // Check if DHL is configured
    const isConfigured = await dhlService.isConfigured();
    if (!isConfigured) {
      res.status(400).json({
        error: 'DHL API credentials not configured. Please configure them in settings.'
      });
      return;
    }

    // Prepare shipment request for DHL
    const shipmentRequest: DHLShipmentRequest = {
      shipmentDetails: {
        productCode: serviceType,
        serviceType: serviceType,
        account: process.env.DHL_ACCOUNT_NUMBER || '',
        currencyCode: 'EUR',
        unitOfMeasurement: 'metric'
      },
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false
      },
      packages: [{
        weight: weight,
        dimensions: {
          length: length || 10,
          width: width || 10,
          height: height || 10
        }
      }],
      shipper,
      consignee
    };

    // Create shipment via DHL API
    const dhlResponse = await dhlService.createShipment(shipmentRequest);

    if (!dhlResponse.success || !dhlResponse.data) {
      res.status(400).json({
        error: 'Failed to create shipment with DHL',
        details: dhlResponse.error
      });
      return;
    }

    const { shipmentNumber, trackingNumber, routingCode, labelData } = dhlResponse.data;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        
        const label = await repo.createShippingLabel({
          returnId,
          shipmentNumber,
          trackingNumber,
          routingCode,
          labelData,
          labelFilename: `label_${shipmentNumber}.pdf`,
          shipper: {
            name: shipper.name,
            address: shipper.address.streetAddress,
            city: shipper.address.city,
            postalCode: shipper.address.postalCode,
            country: shipper.address.countryCode,
            phone: shipper.phone,
            email: shipper.email
          },
          consignee: {
            name: consignee.name,
            address: consignee.address.streetAddress,
            city: consignee.address.city,
            postalCode: consignee.address.postalCode,
            country: consignee.address.countryCode,
            phone: consignee.phone,
            email: consignee.email
          },
          packageDetails: {
            serviceType,
            weight,
            length,
            width,
            height
          }
        });

        return transformShippingLabelEntity(label);
      },
      // Fallback to original implementation
      () => {
        const labelId = shippingDb.createShippingLabel({
          returnId,
          shipmentNumber,
          trackingNumber,
          routingCode,
          labelData,
          labelFilename: `label_${shipmentNumber}.pdf`,
          shipper,
          consignee,
          serviceType,
          weight,
          length,
          width,
          height
        });
        
        return shippingDb.getShippingLabelById(labelId);
      },
      'create-shipping-label'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForShipping() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📦 Shipping label created using ${method}`);
    }

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating shipping label:', error);
    res.status(500).json({ 
      error: 'Failed to create shipping label',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler<{}, any, CreateShippingLabelRequest>);

// Get shipping labels for a specific return
router.get('/labels/return/:returnId', (async (req, res) => {
  try {
    const { returnId } = req.params;
    const returnIdNum = parseInt(returnId);

    if (isNaN(returnIdNum)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        const labels = await repo.getShippingLabelsByReturnId(returnIdNum);
        return labels.map(transformShippingLabelEntity);
      },
      // Fallback to original implementation
      () => shippingDb.getShippingLabelsByReturnId(returnIdNum),
      'get-shipping-labels-by-return-id'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching shipping labels:', error);
    res.status(500).json({ error: 'Failed to fetch shipping labels' });
  }
}) as RequestHandler<ReturnIdParams>);

// Get specific shipping label
router.get('/labels/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        const label = await repo.findOne({
          where: { id },
          relations: ['trackingEvents']
        });
        
        if (!label) return null;
        return transformShippingLabelEntity(label);
      },
      // Fallback to original implementation
      () => shippingDb.getShippingLabelById(id),
      'get-shipping-label-by-id'
    );

    if (!result) {
      res.status(404).json({ error: 'Shipping label not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching shipping label:', error);
    res.status(500).json({ error: 'Failed to fetch shipping label' });
  }
}) as RequestHandler<IdParams>);

// Download shipping label PDF
router.get('/labels/:id/download', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        const label = await repo.findOne({ where: { id } });
        return label ? {
          labelData: label.labelData,
          filename: label.labelFilename || `label_${label.shipmentNumber}.pdf`
        } : null;
      },
      // Fallback to original implementation
      () => {
        const label = shippingDb.getShippingLabelById(id);
        return label ? {
          labelData: label.labelData,
          filename: label.labelFilename || `label_${label.shipmentNumber}.pdf`
        } : null;
      },
      'download-shipping-label'
    );

    if (!result) {
      res.status(404).json({ error: 'Shipping label not found' });
      return;
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(result.labelData, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading shipping label:', error);
    res.status(500).json({ error: 'Failed to download shipping label' });
  }
}) as RequestHandler<IdParams>);

// Update shipping label status
router.patch('/labels/:id/status', (async (req, res) => {
  try {
    const { id } = req.params;
    const { status }: { status: string } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        await repo.updateLabelStatus(id, status);
        
        const updated = await repo.findOne({
          where: { id },
          relations: ['trackingEvents']
        });
        
        return updated ? transformShippingLabelEntity(updated) : null;
      },
      // Fallback to original implementation
      () => {
        const success = shippingDb.updateShippingLabelStatus(id, status);
        return success ? shippingDb.getShippingLabelById(id) : null;
      },
      'update-shipping-label-status'
    );

    if (!result) {
      res.status(404).json({ error: 'Shipping label not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating shipping label status:', error);
    res.status(500).json({ error: 'Failed to update shipping label status' });
  }
}) as RequestHandler<IdParams, any, { status: string }>);

// Delete shipping label
router.delete('/labels/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getShippingRepository();
        const label = await repo.findOne({ where: { id } });
        if (!label) return false;
        
        await repo.delete(id);
        return true;
      },
      // Fallback to original implementation
      () => shippingDb.deleteShippingLabel(id),
      'delete-shipping-label'
    );

    if (!result) {
      res.status(404).json({ error: 'Shipping label not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shipping label:', error);
    res.status(500).json({ error: 'Failed to delete shipping label' });
  }
}) as RequestHandler<IdParams>);

// Track shipment via DHL API
router.get('/track/:trackingNumber', (async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Check if DHL is configured
    const isConfigured = await dhlService.isConfigured();
    if (!isConfigured) {
      res.status(400).json({
        error: 'DHL API credentials not configured'
      });
      return;
    }

    // Get tracking information from DHL
    const trackingResponse = await dhlService.trackShipment(trackingNumber);

    if (!trackingResponse.success || !trackingResponse.data) {
      res.status(400).json({
        error: 'Failed to track shipment',
        details: trackingResponse.error
      });
      return;
    }

    // Update local tracking data (if TypeORM is enabled)
    if (useTypeORMForShipping()) {
      try {
        const shippingRepo = getShippingRepository();
        const trackingRepo = getShippingTrackingRepository();
        
        const label = await shippingRepo.getShippingLabelByTrackingNumber(trackingNumber);
        if (label && trackingResponse.data.events) {
          // Add new tracking events
          for (const event of trackingResponse.data.events) {
            await trackingRepo.addTrackingEvent({
              shippingLabelId: label.id,
              eventType: event.type || 'status_update',
              status: event.status || 'in_transit',
              location: event.location,
              timestamp: new Date(event.timestamp),
              description: event.description,
              eventDetails: event
            });
          }
        }
      } catch (updateError) {
        console.warn('Failed to update local tracking data:', updateError);
        // Don't fail the whole operation if local update fails
      }
    }

    res.json({ data: trackingResponse.data });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({ error: 'Failed to track shipment' });
  }
}) as RequestHandler<TrackingParams>);

// DHL Settings Management

// Get DHL configuration status
router.get('/settings/dhl', (async (req, res) => {
  try {
    const clientId = await getDHLClientId();
    const clientSecret = await getDHLClientSecret();
    
    const isConfigured = !!(clientId && clientSecret);
    const isValid = isConfigured ? await dhlService.isConfigured() : false;

    res.json({
      data: {
        isConfigured,
        isValid,
        environment: process.env.DHL_ENVIRONMENT || 'sandbox',
        lastTested: null // Could be enhanced with last test timestamp
      }
    });
  } catch (error) {
    console.error('Error fetching DHL settings:', error);
    res.status(500).json({ error: 'Failed to fetch DHL settings' });
  }
}) as RequestHandler);

// Save DHL credentials
router.post('/settings/dhl', (async (req, res) => {
  try {
    const { clientId, clientSecret, environment, accountNumber }: DHLCredentialsRequest = req.body;

    if (!clientId || !clientSecret) {
      res.status(400).json({ error: 'Client ID and Client Secret are required' });
      return;
    }

    // Store credentials securely
    await setDHLCredentials(clientId, clientSecret);
    
    // Set environment variables
    if (environment) {
      process.env.DHL_ENVIRONMENT = environment;
    }
    if (accountNumber) {
      process.env.DHL_ACCOUNT_NUMBER = accountNumber;
    }

    res.json({ 
      data: { 
        message: 'DHL credentials saved successfully',
        environment: environment || 'sandbox'
      } 
    });
  } catch (error) {
    console.error('Error saving DHL credentials:', error);
    res.status(500).json({ error: 'Failed to save DHL credentials' });
  }
}) as RequestHandler<{}, any, DHLCredentialsRequest>);

// Delete DHL credentials
router.delete('/settings/dhl', (async (req, res) => {
  try {
    await deleteDHLCredentials();
    
    res.json({ 
      data: { message: 'DHL credentials deleted successfully' } 
    });
  } catch (error) {
    console.error('Error deleting DHL credentials:', error);
    res.status(500).json({ error: 'Failed to delete DHL credentials' });
  }
}) as RequestHandler);

// Test DHL API connection
router.post('/settings/dhl/test', (async (req, res) => {
  try {
    const isConfigured = await dhlService.isConfigured();
    
    if (!isConfigured) {
      res.status(400).json({
        success: false,
        message: 'DHL credentials not configured'
      });
      return;
    }

    // Test the connection by making a simple API call
    const testResult = await dhlService.testConnection();

    res.json({
      success: testResult.success,
      message: testResult.success ? 
        'DHL API connection successful' : 
        `DHL API connection failed: ${testResult.error}`,
      lastTested: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing DHL connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test DHL connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

// Health check endpoint
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const shippingRepo = getShippingRepository();
        const trackingRepo = getShippingTrackingRepository();
        
        const labelsCount = await shippingRepo.count();
        const trackingEventsCount = await trackingRepo.count();
        
        return {
          status: 'healthy',
          implementation: 'typeorm',
          labelsCount,
          trackingEventsCount,
          dhlConfigured: await dhlService.isConfigured(),
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      () => {
        const labels = shippingDb.getAllShippingLabels();
        
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          labelsCount: labels.length,
          trackingEventsCount: 0, // Would need to implement in shippingDb
          dhlConfigured: false, // Would need to check via dhlService
          timestamp: new Date().toISOString()
        };
      },
      'shipping-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in shipping health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

export default router;