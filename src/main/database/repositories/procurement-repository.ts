import { BaseRepository } from './base-repository';
import { Requisition } from '../entities/procurement/Requisition';
import { RequisitionItem } from '../entities/procurement/RequisitionItem';
import { RequisitionComment } from '../entities/procurement/RequisitionComment';
import { PurchaseOrder } from '../entities/procurement/PurchaseOrder';
import { getDataSource } from '../typeorm-config';
import { RequisitionStatus, Priority, ProcurementType, CommentType } from '../entities/types';

/**
 * Repository for procurement requisitions with complex workflow support
 */
export class RequisitionRepository extends BaseRepository<Requisition> {
  constructor() {
    super(Requisition);
  }

  /**
   * Get requisition with all relations using TypeORM
   */
  async getRequisitionWithDetails(id: string): Promise<Requisition | null> {
    return this.findOne({
      where: { id },
      relations: ['items', 'comments', 'purchaseOrders']
    });
  }

  /**
   * Get requisitions by status with pagination
   */
  async getRequisitionsByStatus(
    status: RequisitionStatus, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ data: Requisition[]; total: number }> {
    const [data, total] = await this.typeormRepo.findAndCount({
      where: { status },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  /**
   * Create requisition with items using TypeORM transaction
   */
  async createRequisitionWithItems(data: {
    title: string;
    description?: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    department: string;
    priority: Priority;
    procurementType: ProcurementType;
    neededBy?: string;
    budgetCode?: string;
    currency: string;
    notes?: string;
    customFields?: Record<string, any>;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      unit: string;
      supplierName?: string;
      sku?: string;
      notes?: string;
    }>;
  }): Promise<Requisition> {
    const dataSource = getDataSource();
    
    return dataSource.transaction(async manager => {
      // Calculate total amount
      const totalAmount = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      );

      // Create requisition
      const requisition = manager.create(Requisition, {
        id: crypto.randomUUID(),
        ...data,
        totalAmount,
        status: 'draft' as RequisitionStatus
      });
      
      const savedRequisition = await manager.save(requisition);
      
      // Create items
      if (data.items && data.items.length > 0) {
        const items = data.items.map(item => 
          manager.create(RequisitionItem, {
            id: crypto.randomUUID(),
            ...item,
            requisitionId: savedRequisition.id
          })
        );
        await manager.save(items);
        savedRequisition.items = items;
      }
      
      // Add creation comment
      const comment = manager.create(RequisitionComment, {
        id: crypto.randomUUID(),
        requisitionId: savedRequisition.id,
        text: 'Requisition created',
        userId: data.requesterId,
        userName: data.requesterName,
        type: 'system' as CommentType
      });
      await manager.save(comment);
      
      return savedRequisition;
    });
  }

  /**
   * Update requisition status with approval workflow
   */
  async updateRequisitionStatus(
    id: string, 
    newStatus: RequisitionStatus,
    approverId: string,
    approverName: string,
    comment?: string
  ): Promise<void> {
    const dataSource = getDataSource();
    
    await dataSource.transaction(async manager => {
      // Update status
      await manager.update(Requisition, id, {
        status: newStatus,
        approverId: approverId,
        approverName: approverName,
        currentApprover: this.getNextApprover(newStatus) || undefined
      });
      
      // Add approval comment
      const commentType: CommentType = 
        newStatus === 'approved' ? 'approval' : 
        newStatus === 'rejected' ? 'rejection' : 
        'comment';
      
      const approvalComment = manager.create(RequisitionComment, {
        id: crypto.randomUUID(),
        requisitionId: id,
        text: comment || `Status changed to ${newStatus}`,
        userId: approverId,
        userName: approverName,
        type: commentType,
        isInternal: true
      });
      await manager.save(approvalComment);
    });
  }

  /**
   * Get approval queue for a specific approver
   * Uses raw SQL for complex filtering
   */
  async getApprovalQueue(approverId: string): Promise<any[]> {
    const query = `
      SELECT 
        r.*,
        json_group_array(
          json_object(
            'id', i.id,
            'description', i.description,
            'quantity', i.quantity,
            'unitPrice', i.unit_price,
            'unit', i.unit,
            'supplierName', i.supplier_name
          )
        ) as items,
        (
          SELECT json_group_array(
            json_object(
              'id', c.id,
              'text', c.text,
              'userName', c.user_name,
              'createdAt', c.created_at,
              'type', c.type
            )
          )
          FROM requisition_comments c
          WHERE c.requisition_id = r.id
          AND c.is_internal = 0
          ORDER BY c.created_at DESC
          LIMIT 5
        ) as recentComments
      FROM requisitions r
      LEFT JOIN requisition_items i ON r.id = i.requisition_id
      WHERE r.current_approver = ?
      AND r.status IN ('submitted', 'manager_approval', 'finance_approval')
      GROUP BY r.id
      ORDER BY 
        CASE r.priority 
          WHEN 'high' THEN 1 
          WHEN 'normal' THEN 2 
          WHEN 'low' THEN 3 
        END,
        r.created_at ASC
    `;
    
    const results = this.executeRawQuery(query, [approverId]);
    
    return results.map(row => ({
      ...row,
      items: JSON.parse(row.items),
      recentComments: JSON.parse(row.recentComments || '[]'),
      customFields: this.parseJson(row.custom_fields as string, {})
    }));
  }

  /**
   * Get requisition statistics by department
   */
  async getStatisticsByDepartment(startDate?: Date, endDate?: Date): Promise<any> {
    let dateFilter = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE r.created_at BETWEEN ? AND ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    }
    
    const query = `
      SELECT 
        r.department,
        COUNT(DISTINCT r.id) as totalRequisitions,
        SUM(r.total_amount) as totalAmount,
        AVG(r.total_amount) as avgAmount,
        COUNT(DISTINCT CASE WHEN r.status = 'approved' THEN r.id END) as approvedCount,
        COUNT(DISTINCT CASE WHEN r.status = 'rejected' THEN r.id END) as rejectedCount,
        COUNT(DISTINCT CASE WHEN r.status IN ('submitted', 'manager_approval', 'finance_approval') THEN r.id END) as pendingCount
      FROM requisitions r
      ${dateFilter}
      GROUP BY r.department
      ORDER BY totalAmount DESC
    `;
    
    return this.executeRawQuery(query, params);
  }

  /**
   * Helper method to determine next approver based on status
   */
  private getNextApprover(status: RequisitionStatus): string | null {
    switch (status) {
      case 'submitted':
        return 'manager';
      case 'manager_approval':
        return 'finance';
      case 'finance_approval':
        return 'procurement';
      default:
        return null;
    }
  }
}

/**
 * Repository for purchase orders
 */
export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder> {
  constructor() {
    super(PurchaseOrder);
  }

  /**
   * Create PO from approved requisition
   */
  async createFromRequisition(requisitionId: string): Promise<PurchaseOrder> {
    const requisitionRepo = new RequisitionRepository();
    const requisition = await requisitionRepo.getRequisitionWithDetails(requisitionId);
    
    if (!requisition) {
      throw new Error('Requisition not found');
    }
    
    if (requisition.status !== 'approved') {
      throw new Error('Only approved requisitions can be converted to POs');
    }

    const dataSource = getDataSource();
    
    return dataSource.transaction(async manager => {
      // Generate PO number
      const poNumber = await this.generatePONumber();
      
      // Create PO from requisition data
      const po = manager.create(PurchaseOrder, {
        id: crypto.randomUUID(),
        requisitionId: requisitionId,
        orderNumber: poNumber,
        title: requisition.title,
        description: requisition.description,
        requesterId: requisition.requesterId,
        requesterName: requisition.requesterName,
        department: requisition.department,
        priority: requisition.priority,
        status: 'draft',
        procurementType: requisition.procurementType,
        customFields: requisition.customFields,
        totalAmount: requisition.totalAmount,
        currency: requisition.currency,
        items: requisition.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          supplierName: item.supplierName,
          sku: item.sku,
          notes: item.notes
        })),
        billingAddress: await this.getDefaultBillingAddress(),
        shippingAddress: await this.getDefaultShippingAddress()
      });
      
      const savedPO = await manager.save(po);
      
      // Update requisition status
      await manager.update(Requisition, requisitionId, {
        status: 'converted' as RequisitionStatus
      });
      
      // Add conversion comment
      const comment = manager.create(RequisitionComment, {
        id: crypto.randomUUID(),
        requisitionId: requisitionId,
        text: `Converted to Purchase Order ${poNumber}`,
        userId: 'system',
        userName: 'System',
        type: 'system' as CommentType
      });
      await manager.save(comment);
      
      return savedPO;
    });
  }

  /**
   * Generate unique PO number
   */
  private async generatePONumber(): Promise<string> {
    const result = this.executeRawQuerySingle<{ maxNumber: number }>(
      `SELECT MAX(CAST(SUBSTR(order_number, 4) AS INTEGER)) as maxNumber 
       FROM purchase_orders 
       WHERE order_number LIKE 'PO-%'`
    );
    
    const nextNumber = (result?.maxNumber || 0) + 1;
    return `PO-${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Get default addresses from settings
   */
  private async getDefaultBillingAddress(): Promise<any> {
    // This would integrate with settings repository
    return {
      name: 'Company Name',
      street: '123 Main St',
      city: 'City',
      postalCode: '12345',
      country: 'Country'
    };
  }

  private async getDefaultShippingAddress(): Promise<any> {
    // This would integrate with settings repository
    return {
      name: 'Company Warehouse',
      street: '456 Warehouse Ave',
      city: 'City',
      postalCode: '12345',
      country: 'Country'
    };
  }

  /**
   * Get purchase orders with aggregated data
   */
  async getPurchaseOrdersWithStats(): Promise<any[]> {
    const query = `
      SELECT 
        p.*,
        r.title as requisitionTitle,
        COUNT(DISTINCT json_extract(value, '$.id')) as itemCount,
        SUM(json_extract(value, '$.quantity')) as totalQuantity
      FROM purchase_orders p
      LEFT JOIN requisitions r ON p.requisition_id = r.id
      CROSS JOIN json_each(p.items)
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const results = this.executeRawQuery(query);
    
    return results.map(row => ({
      ...row,
      items: JSON.parse(row.items as string),
      customFields: this.parseJson(row.custom_fields as string, {}),
      billingAddress: JSON.parse(row.billing_address as string),
      shippingAddress: JSON.parse(row.shipping_address as string)
    }));
  }
}