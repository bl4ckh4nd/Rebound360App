import https from 'https';
import { URLSearchParams } from 'url';
import { getDHLClientId, getDHLClientSecret } from './credentials';

export interface DHLShipmentAddress {
  name1: string;
  name2?: string;
  name3?: string;
  streetName: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface DHLShipmentItem {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface DHLShipmentRequest {
  shipmentDetails: {
    product: string;
    accountNumber: string;
    shipmentDate: string;
    proofOfDelivery?: boolean;
    service?: {
      visualCheckOfAge?: string;
      preferredLocation?: string;
      preferredNeighbour?: string;
      preferredDay?: string;
    };
  };
  shipper: DHLShipmentAddress;
  consignee: DHLShipmentAddress;
  shipmentItem: DHLShipmentItem;
}

export interface DHLShipmentResponse {
  shipmentNumber: string;
  labelData: string; // Base64 encoded PDF
  trackingNumber?: string;
  routingCode?: string;
}

export interface DHLAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class DHLService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = process.env.DHL_API_BASE_URL || 'https://api-eu.dhl.com';
  }

  private async getCredentials(): Promise<{ clientId: string; clientSecret: string }> {
    const clientId = await getDHLClientId();
    const clientSecret = await getDHLClientSecret();

    if (!clientId || !clientSecret) {
      throw new Error('DHL API credentials not configured. Please configure them in the application settings.');
    }

    return { clientId, clientSecret };
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const { clientId, clientSecret } = await this.getCredentials();
    const authUrl = `${this.baseUrl}/v1/authorization/tokens`;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const postData = new URLSearchParams({
      grant_type: 'client_credentials'
    }).toString();

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    try {
      const response = await this.makeRequest(authUrl, options, postData);
      const authData: DHLAuthResponse = JSON.parse(response);
      
      this.accessToken = authData.access_token;
      this.tokenExpiry = Date.now() + (authData.expires_in * 1000) - 60000; // Refresh 1 minute before expiry
      
      return this.accessToken;
    } catch (error) {
      throw new Error(`DHL authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private makeRequest(url: string, options: any, postData?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async createShipment(shipmentData: DHLShipmentRequest): Promise<DHLShipmentResponse> {
    try {
      const token = await this.authenticate();
      const shipmentUrl = `${this.baseUrl}/v1/shipments`;

      const requestBody = {
        shipmentDetails: {
          ...shipmentData.shipmentDetails,
          labelResponseType: 'PDF'
        },
        shipper: {
          name1: shipmentData.shipper.name1,
          name2: shipmentData.shipper.name2,
          name3: shipmentData.shipper.name3,
          streetName: shipmentData.shipper.streetName,
          houseNumber: shipmentData.shipper.houseNumber,
          city: shipmentData.shipper.city,
          postalCode: shipmentData.shipper.postalCode,
          country: shipmentData.shipper.country,
          contactPerson: shipmentData.shipper.contactPerson,
          phone: shipmentData.shipper.phone,
          email: shipmentData.shipper.email
        },
        consignee: {
          name1: shipmentData.consignee.name1,
          name2: shipmentData.consignee.name2,
          name3: shipmentData.consignee.name3,
          streetName: shipmentData.consignee.streetName,
          houseNumber: shipmentData.consignee.houseNumber,
          city: shipmentData.consignee.city,
          postalCode: shipmentData.consignee.postalCode,
          country: shipmentData.consignee.country,
          contactPerson: shipmentData.consignee.contactPerson,
          phone: shipmentData.consignee.phone,
          email: shipmentData.consignee.email
        },
        shipmentItem: {
          weight: shipmentData.shipmentItem.weight,
          length: shipmentData.shipmentItem.length,
          width: shipmentData.shipmentItem.width,
          height: shipmentData.shipmentItem.height
        }
      };

      const postData = JSON.stringify(requestBody);
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(shipmentUrl, options, postData);
      const shipmentResponse = JSON.parse(response);

      return {
        shipmentNumber: shipmentResponse.shipmentNumber,
        labelData: shipmentResponse.labelData,
        trackingNumber: shipmentResponse.trackingNumber,
        routingCode: shipmentResponse.routingCode
      };
    } catch (error) {
      throw new Error(`DHL shipment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const token = await this.authenticate();
      const trackingUrl = `${this.baseUrl}/v1/tracking?trackingNumber=${trackingNumber}`;

      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await this.makeRequest(trackingUrl, options);
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`DHL tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateAddress(address: DHLShipmentAddress): Promise<boolean> {
    try {
      const token = await this.authenticate();
      const validationUrl = `${this.baseUrl}/v1/address-validation`;

      const requestBody = {
        address: {
          name1: address.name1,
          streetName: address.streetName,
          houseNumber: address.houseNumber,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country
        }
      };

      const postData = JSON.stringify(requestBody);
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await this.makeRequest(validationUrl, options, postData);
      const validationResponse = JSON.parse(response);
      
      return validationResponse.isValid === true;
    } catch (error) {
      console.warn(`DHL address validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async isConfigured(): Promise<boolean> {
    try {
      const clientId = await getDHLClientId();
      const clientSecret = await getDHLClientSecret();
      return !!(clientId && clientSecret);
    } catch (error) {
      return false;
    }
  }
}

export const dhlService = new DHLService();