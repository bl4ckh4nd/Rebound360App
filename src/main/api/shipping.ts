import express, { Request, Response } from 'express';
import { dhlService } from '../services/dhl-service';
import { shippingDb } from '../database/shipping';
import type { DHLShipmentRequest, DHLShipmentAddress } from '../services/dhl-service';
import { setDHLCredentials, getDHLClientId, getDHLClientSecret, deleteDHLCredentials } from '../services/credentials';

const router = express.Router();

// Create shipping label
router.post('/labels', async (req: Request, res: Response) => {
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
    }: {
      returnId: number;
      shipper: DHLShipmentAddress;
      consignee: DHLShipmentAddress;
      weight: number;
      length?: number;
      width?: number;
      height?: number;
      serviceType?: string;
    } = req.body;

    if (!returnId || !shipper || !consignee || !weight) {
      return res.status(400).json({
        error: 'Missing required fields: returnId, shipper, consignee, weight'
      });
    }

    // Check if DHL is configured
    const isConfigured = await dhlService.isConfigured();
    if (!isConfigured) {
      return res.status(400).json({
        error: 'DHL API credentials not configured. Please configure them in settings.'
      });
    }

    // Prepare shipment request
    const shipmentRequest: DHLShipmentRequest = {
      shipmentDetails: {
        product: serviceType,
        accountNumber: '', // This will be set by DHL service if needed
        shipmentDate: new Date().toISOString().split('T')[0],
        proofOfDelivery: true
      },
      shipper,
      consignee,
      shipmentItem: {
        weight,
        length,
        width,
        height
      }
    };

    // Create shipment with DHL
    const shipmentResponse = await dhlService.createShipment(shipmentRequest);

    // Save to database
    const labelData = {
      return_id: returnId,
      shipment_number: shipmentResponse.shipmentNumber,
      tracking_number: shipmentResponse.trackingNumber,
      routing_code: shipmentResponse.routingCode,
      label_data: shipmentResponse.labelData,
      label_filename: `shipping_label_${shipmentResponse.shipmentNumber}.pdf`,
      shipper,
      consignee,
      service_type: serviceType,
      weight,
      length,
      width,
      height
    };

    const shippingLabel = shippingDb.createShippingLabel(labelData);

    res.json({
      success: true,
      data: {
        id: shippingLabel.id,
        shipmentNumber: shippingLabel.shipment_number,
        trackingNumber: shippingLabel.tracking_number,
        labelFilename: shippingLabel.label_filename,
        status: shippingLabel.status,
        createdAt: shippingLabel.created_at
      }
    });
  } catch (error) {
    console.error('Error creating shipping label:', error);
    res.status(500).json({
      error: 'Failed to create shipping label',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shipping labels for a return
router.get('/labels/return/:returnId', async (req: Request, res: Response) => {
  try {
    const returnId = parseInt(req.params.returnId);
    if (isNaN(returnId)) {
      return res.status(400).json({ error: 'Invalid return ID' });
    }

    const labels = shippingDb.getShippingLabelsByReturnId(returnId);
    res.json({ success: true, data: labels });
  } catch (error) {
    console.error('Error fetching shipping labels:', error);
    res.status(500).json({
      error: 'Failed to fetch shipping labels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get shipping label by ID
router.get('/labels/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid label ID' });
    }

    const label = shippingDb.getShippingLabelById(id);
    if (!label) {
      return res.status(404).json({ error: 'Shipping label not found' });
    }

    res.json({ success: true, data: label });
  } catch (error) {
    console.error('Error fetching shipping label:', error);
    res.status(500).json({
      error: 'Failed to fetch shipping label',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download shipping label PDF
router.get('/labels/:id/download', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid label ID' });
    }

    const label = shippingDb.getShippingLabelById(id);
    if (!label) {
      return res.status(404).json({ error: 'Shipping label not found' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(label.label_data, 'base64');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${label.label_filename || 'shipping_label.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading shipping label:', error);
    res.status(500).json({
      error: 'Failed to download shipping label',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Track shipment
router.get('/track/:trackingNumber', async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    // Check if DHL is configured
    const isConfigured = await dhlService.isConfigured();
    if (!isConfigured) {
      return res.status(400).json({
        error: 'DHL API credentials not configured. Please configure them in settings.'
      });
    }

    const trackingInfo = await dhlService.trackShipment(trackingNumber);
    
    // Optionally save tracking events to database
    // This would require parsing the DHL response and extracting events

    res.json({ success: true, data: trackingInfo });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      error: 'Failed to track shipment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update shipping label status
router.patch('/labels/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid label ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = shippingDb.updateShippingLabelStatus(id, status);
    
    if (!updated) {
      return res.status(404).json({ error: 'Shipping label not found' });
    }

    const updatedLabel = shippingDb.getShippingLabelById(id);
    res.json({ success: true, data: updatedLabel });
  } catch (error) {
    console.error('Error updating shipping label status:', error);
    res.status(500).json({
      error: 'Failed to update shipping label status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete shipping label
router.delete('/labels/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid label ID' });
    }

    const deleted = shippingDb.deleteShippingLabel(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Shipping label not found' });
    }

    res.json({ success: true, message: 'Shipping label deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping label:', error);
    res.status(500).json({
      error: 'Failed to delete shipping label',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DHL Settings endpoints
router.get('/settings/dhl', async (req: Request, res: Response) => {
  try {
    const clientId = await getDHLClientId();
    const isConfigured = await dhlService.isConfigured();
    
    res.json({
      success: true,
      data: {
        isConfigured,
        clientId: clientId || null, // Don't expose the secret
        baseUrl: process.env.DHL_API_BASE_URL || 'https://api-eu.dhl.com'
      }
    });
  } catch (error) {
    console.error('Error fetching DHL settings:', error);
    res.status(500).json({
      error: 'Failed to fetch DHL settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/settings/dhl', async (req: Request, res: Response) => {
  try {
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'Both clientId and clientSecret are required'
      });
    }

    await setDHLCredentials(clientId, clientSecret);
    
    res.json({
      success: true,
      message: 'DHL credentials saved successfully'
    });
  } catch (error) {
    console.error('Error saving DHL settings:', error);
    res.status(500).json({
      error: 'Failed to save DHL settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/settings/dhl', async (req: Request, res: Response) => {
  try {
    await deleteDHLCredentials();
    
    res.json({
      success: true,
      message: 'DHL credentials deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting DHL settings:', error);
    res.status(500).json({
      error: 'Failed to delete DHL settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test DHL connection
router.post('/settings/dhl/test', async (req: Request, res: Response) => {
  try {
    const isConfigured = await dhlService.isConfigured();
    if (!isConfigured) {
      return res.status(400).json({
        error: 'DHL API credentials not configured'
      });
    }

    // Try to authenticate to test the connection
    const testAddress: DHLShipmentAddress = {
      name1: 'Test Company',
      streetName: 'Test Street',
      houseNumber: '1',
      city: 'Hamburg',
      postalCode: '20095',
      country: 'DE'
    };

    const isValid = await dhlService.validateAddress(testAddress);
    
    res.json({
      success: true,
      message: 'DHL connection test successful',
      addressValidation: isValid
    });
  } catch (error) {
    console.error('Error testing DHL connection:', error);
    res.status(500).json({
      error: 'DHL connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;