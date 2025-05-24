import { getDatabase } from './db';
import type { DHLShipmentAddress } from '../services/dhl-service';

export interface ShippingLabel {
  id: number;
  return_id: number;
  shipment_number: string;
  tracking_number?: string;
  routing_code?: string;
  label_data: string; // Base64 encoded PDF
  label_filename?: string;
  shipper_name: string;
  shipper_address: string;
  shipper_city: string;
  shipper_postal_code: string;
  shipper_country: string;
  shipper_phone?: string;
  shipper_email?: string;
  consignee_name: string;
  consignee_address: string;
  consignee_city: string;
  consignee_postal_code: string;
  consignee_country: string;
  consignee_phone?: string;
  consignee_email?: string;
  service_type: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingTrackingEvent {
  id: number;
  shipping_label_id: number;
  tracking_number: string;
  status: string;
  status_description?: string;
  location?: string;
  timestamp: string;
  event_details?: string; // JSON string
  created_at: string;
}

export interface CreateShippingLabelData {
  return_id: number;
  shipment_number: string;
  tracking_number?: string;
  routing_code?: string;
  label_data: string;
  label_filename?: string;
  shipper: DHLShipmentAddress;
  consignee: DHLShipmentAddress;
  service_type?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

export class ShippingDatabase {
  private db = getDatabase();

  createShippingLabel(data: CreateShippingLabelData): ShippingLabel {
    const stmt = this.db.prepare(`
      INSERT INTO shipping_labels (
        return_id, shipment_number, tracking_number, routing_code, label_data, label_filename,
        shipper_name, shipper_address, shipper_city, shipper_postal_code, shipper_country, 
        shipper_phone, shipper_email,
        consignee_name, consignee_address, consignee_city, consignee_postal_code, consignee_country,
        consignee_phone, consignee_email,
        service_type, weight, length, width, height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const shipperAddress = `${data.shipper.streetName} ${data.shipper.houseNumber}`;
    const consigneeAddress = `${data.consignee.streetName} ${data.consignee.houseNumber}`;

    const result = stmt.run(
      data.return_id,
      data.shipment_number,
      data.tracking_number,
      data.routing_code,
      data.label_data,
      data.label_filename,
      data.shipper.name1,
      shipperAddress,
      data.shipper.city,
      data.shipper.postalCode,
      data.shipper.country,
      data.shipper.phone,
      data.shipper.email,
      data.consignee.name1,
      consigneeAddress,
      data.consignee.city,
      data.consignee.postalCode,
      data.consignee.country,
      data.consignee.phone,
      data.consignee.email,
      data.service_type || 'V01PAK',
      data.weight,
      data.length,
      data.width,
      data.height
    );

    return this.getShippingLabelById(result.lastInsertRowid as number)!;
  }

  getShippingLabelById(id: number): ShippingLabel | null {
    const stmt = this.db.prepare('SELECT * FROM shipping_labels WHERE id = ?');
    return stmt.get(id) as ShippingLabel | null;
  }

  getShippingLabelByShipmentNumber(shipmentNumber: string): ShippingLabel | null {
    const stmt = this.db.prepare('SELECT * FROM shipping_labels WHERE shipment_number = ?');
    return stmt.get(shipmentNumber) as ShippingLabel | null;
  }

  getShippingLabelsByReturnId(returnId: number): ShippingLabel[] {
    const stmt = this.db.prepare('SELECT * FROM shipping_labels WHERE return_id = ? ORDER BY created_at DESC');
    return stmt.all(returnId) as ShippingLabel[];
  }

  getAllShippingLabels(): ShippingLabel[] {
    const stmt = this.db.prepare('SELECT * FROM shipping_labels ORDER BY created_at DESC');
    return stmt.all() as ShippingLabel[];
  }

  updateShippingLabelStatus(id: number, status: string): boolean {
    const stmt = this.db.prepare('UPDATE shipping_labels SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    return result.changes > 0;
  }

  updateShippingLabelTracking(id: number, trackingNumber: string, routingCode?: string): boolean {
    const stmt = this.db.prepare('UPDATE shipping_labels SET tracking_number = ?, routing_code = ? WHERE id = ?');
    const result = stmt.run(trackingNumber, routingCode, id);
    return result.changes > 0;
  }

  deleteShippingLabel(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM shipping_labels WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  addTrackingEvent(data: {
    shipping_label_id: number;
    tracking_number: string;
    status: string;
    status_description?: string;
    location?: string;
    timestamp: string;
    event_details?: any;
  }): ShippingTrackingEvent {
    const stmt = this.db.prepare(`
      INSERT INTO shipping_tracking (
        shipping_label_id, tracking_number, status, status_description, 
        location, timestamp, event_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.shipping_label_id,
      data.tracking_number,
      data.status,
      data.status_description,
      data.location,
      data.timestamp,
      data.event_details ? JSON.stringify(data.event_details) : null
    );

    const getStmt = this.db.prepare('SELECT * FROM shipping_tracking WHERE id = ?');
    return getStmt.get(result.lastInsertRowid as number) as ShippingTrackingEvent;
  }

  getTrackingEventsByLabelId(shippingLabelId: number): ShippingTrackingEvent[] {
    const stmt = this.db.prepare('SELECT * FROM shipping_tracking WHERE shipping_label_id = ? ORDER BY timestamp DESC');
    return stmt.all(shippingLabelId) as ShippingTrackingEvent[];
  }

  getTrackingEventsByTrackingNumber(trackingNumber: string): ShippingTrackingEvent[] {
    const stmt = this.db.prepare('SELECT * FROM shipping_tracking WHERE tracking_number = ? ORDER BY timestamp DESC');
    return stmt.all(trackingNumber) as ShippingTrackingEvent[];
  }

  getLatestTrackingStatus(trackingNumber: string): ShippingTrackingEvent | null {
    const stmt = this.db.prepare(`
      SELECT * FROM shipping_tracking 
      WHERE tracking_number = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    return stmt.get(trackingNumber) as ShippingTrackingEvent | null;
  }

  cleanupOldTrackingEvents(daysOld: number = 90): number {
    const stmt = this.db.prepare(`
      DELETE FROM shipping_tracking 
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysOld);
    return result.changes;
  }
}

export const shippingDb = new ShippingDatabase();