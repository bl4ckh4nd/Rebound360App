import { DataSource } from 'typeorm';
import { getDataSource as getTypeORMDataSource } from './typeorm-config';
import { CustomFieldRepository } from './repositories/custom-field-repository';
import { WorkflowRepository } from './repositories/settings-repository';
import { SupplierReturnRepository } from './repositories/supplier-return-repository';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource) {
    dataSource = getTypeORMDataSource();
  }
  
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  
  return dataSource;
}

// Repository factory function that returns properly initialized repositories
export function getCustomFieldRepository(): CustomFieldRepository {
  return new CustomFieldRepository();
}

// Factory function for workflow repository
export function getWorkflowRepository(): WorkflowRepository {
  return new WorkflowRepository();
}

// Factory function for supplier return repository
export function getSupplierReturnRepositoryTypeORM(): SupplierReturnRepository {
  return new SupplierReturnRepository();
}

// Re-export from repositories index for consistency
export { 
  getSupplierReturnRepository,
  getSettingsRepository,
  getReasonRepository,
  getRequisitionRepository,
  getPurchaseOrderRepository,
  getSupplierSyncRepository,
  getOrderSyncRepository,
  getSyncStatusRepository
} from './repositories';