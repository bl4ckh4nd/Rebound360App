import { BaseRepository } from './base-repository';
import { ShippingLabel } from '../entities/shipping/ShippingLabel';
import { ShippingTracking } from '../entities/shipping/ShippingTracking';
import { getDataSource } from '../typeorm-config';

/**
 * Repository for shipping labels with DHL integration support
 */
export class ShippingRepository extends BaseRepository<ShippingLabel> {
  constructor() {
    super(ShippingLabel);
  }

  /**
   * Get shipping labels for a specific return with tracking events
   */
  async getShippingLabelsByReturnId(returnId: number): Promise<ShippingLabel[]> {
    return await this.typeormRepo.find({
      where: { returnId },
      relations: ['trackingEvents'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get label by shipment number
   */
  async getShippingLabelByShipmentNumber(shipmentNumber: string): Promise<ShippingLabel | null> {
    return await this.findOne({
      where: { shipmentNumber },
      relations: ['trackingEvents']
    });
  }

  /**
   * Get label by tracking number
   */
  async getShippingLabelByTrackingNumber(trackingNumber: string): Promise<ShippingLabel | null> {
    return await this.findOne({
      where: { trackingNumber },
      relations: ['trackingEvents']
    });
  }

  /**
   * Create shipping label with full transaction safety
   */
  async createShippingLabel(labelData: {
    returnId: number;
    shipmentNumber: string;
    trackingNumber?: string;
    routingCode?: string;
    labelData: string; // Base64 PDF
    labelFilename?: string;
    shipper: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone?: string;
      email?: string;
    };
    consignee: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone?: string;
      email?: string;
    };
    packageDetails: {
      serviceType: string;
      weight: number;
      length?: number;
      width?: number;
      height?: number;
    };
  }): Promise<ShippingLabel> {
    const label = this.typeormRepo.create({
      returnId: labelData.returnId,
      shipmentNumber: labelData.shipmentNumber,
      trackingNumber: labelData.trackingNumber,
      routingCode: labelData.routingCode,
      labelData: labelData.labelData,
      labelFilename: labelData.labelFilename,
      
      // Shipper details
      shipperName: labelData.shipper.name,
      shipperAddress: labelData.shipper.address,
      shipperCity: labelData.shipper.city,
      shipperPostalCode: labelData.shipper.postalCode,
      shipperCountry: labelData.shipper.country,
      shipperPhone: labelData.shipper.phone,
      shipperEmail: labelData.shipper.email,
      
      // Consignee details
      consigneeName: labelData.consignee.name,
      consigneeAddress: labelData.consignee.address,
      consigneeCity: labelData.consignee.city,
      consigneePostalCode: labelData.consignee.postalCode,
      consigneeCountry: labelData.consignee.country,
      consigneePhone: labelData.consignee.phone,
      consigneeEmail: labelData.consignee.email,
      
      // Package details
      serviceType: labelData.packageDetails.serviceType,
      weight: labelData.packageDetails.weight,
      length: labelData.packageDetails.length,
      width: labelData.packageDetails.width,
      height: labelData.packageDetails.height,
      
      status: 'created'
    });

    return await this.save(label);
  }

  /**
   * Update label status
   */
  async updateLabelStatus(labelId: string, status: string): Promise<void> {
    await this.update(labelId, { status });
  }

  /**
   * Get recent shipping labels with pagination
   */
  async getRecentLabels(
    page: number = 1, 
    limit: number = 20
  ): Promise<{ data: ShippingLabel[]; total: number }> {
    const [data, total] = await this.typeormRepo.findAndCount({
      relations: ['trackingEvents'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  /**
   * Search labels by various criteria
   */
  async searchLabels(criteria: {
    returnId?: number;
    shipmentNumber?: string;
    trackingNumber?: string;
    status?: string;
    consigneeName?: string;
  }): Promise<ShippingLabel[]> {
    const query = this.typeormRepo.createQueryBuilder('label')
      .leftJoinAndSelect('label.trackingEvents', 'tracking')
      .orderBy('label.createdAt', 'DESC');

    if (criteria.returnId) {
      query.andWhere('label.returnId = :returnId', { returnId: criteria.returnId });
    }

    if (criteria.shipmentNumber) {
      query.andWhere('label.shipmentNumber LIKE :shipmentNumber', { 
        shipmentNumber: `%${criteria.shipmentNumber}%` 
      });
    }

    if (criteria.trackingNumber) {
      query.andWhere('label.trackingNumber LIKE :trackingNumber', { 
        trackingNumber: `%${criteria.trackingNumber}%` 
      });
    }

    if (criteria.status) {
      query.andWhere('label.status = :status', { status: criteria.status });
    }

    if (criteria.consigneeName) {
      query.andWhere('label.consigneeName LIKE :consigneeName', { 
        consigneeName: `%${criteria.consigneeName}%` 
      });
    }

    return await query.getMany();
  }

  /**
   * Get labels requiring tracking updates (those without recent tracking)
   */
  async getLabelsRequiringTrackingUpdate(): Promise<ShippingLabel[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return await this.typeormRepo.createQueryBuilder('label')
      .leftJoin('label.trackingEvents', 'tracking')
      .where('label.trackingNumber IS NOT NULL')
      .andWhere('label.status != :status', { status: 'delivered' })
      .andWhere(
        '(tracking.id IS NULL OR tracking.createdAt < :cutoff)',
        { cutoff: threeDaysAgo }
      )
      .getMany();
  }
}

/**
 * Repository for shipping tracking events
 */
export class ShippingTrackingRepository extends BaseRepository<ShippingTracking> {
  constructor() {
    super(ShippingTracking);
  }

  /**
   * Add tracking event for a shipping label
   */
  async addTrackingEvent(data: {
    shippingLabelId: string;
    eventType: string;
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
    eventDetails?: Record<string, any>;
  }): Promise<ShippingTracking> {
    const event = this.typeormRepo.create({
      shippingLabelId: data.shippingLabelId,
      eventType: data.eventType,
      status: data.status,
      location: data.location,
      timestamp: data.timestamp,
      description: data.description,
      eventDetails: data.eventDetails || {}
    });

    return await this.save(event);
  }

  /**
   * Get tracking events for a label
   */
  async getTrackingEventsForLabel(labelId: string): Promise<ShippingTracking[]> {
    return await this.find({
      where: { shippingLabelId: labelId },
      order: { timestamp: 'ASC' }
    });
  }

  /**
   * Get latest tracking event for a label
   */
  async getLatestTrackingEvent(labelId: string): Promise<ShippingTracking | null> {
    return await this.findOne({
      where: { shippingLabelId: labelId },
      order: { timestamp: 'DESC' }
    });
  }

  /**
   * Clean up old tracking events (90+ days)
   */
  async cleanupOldTrackingEvents(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const result = await this.typeormRepo.createQueryBuilder()
      .delete()
      .where('createdAt < :cutoff', { cutoff: cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get tracking statistics
   */
  async getTrackingStatistics(): Promise<{
    totalEvents: number;
    recentEvents: number;
    statusCounts: Record<string, number>;
  }> {
    const totalEvents = await this.count();
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentEvents = await this.count({
      where: {
        createdAt: { $gte: oneDayAgo } as any
      }
    });

    // Get status counts
    const statusResults = await this.typeormRepo.createQueryBuilder('tracking')
      .select('tracking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tracking.status')
      .getRawMany();

    const statusCounts: Record<string, number> = {};
    statusResults.forEach(result => {
      statusCounts[result.status] = parseInt(result.count);
    });

    return {
      totalEvents,
      recentEvents,
      statusCounts
    };
  }
}