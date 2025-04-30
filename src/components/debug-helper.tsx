import { ReturnItem, StatusStep, CustomField } from '../shared/types';

interface DebugHelperProps {
  returnItem: ReturnItem;
  targetStep?: StatusStep;
  customFields: CustomField[];
}

export function DebugHelper({ returnItem, targetStep, customFields }: DebugHelperProps) {
  const missingFields = targetStep?.requiredFields?.filter(fieldName => {
    // For system fields, check directly in returnItem
    if (['commissioningDate', 'shippingDate', 'creditDate', 'creditNoteNumber', 'creditAmount', 
         'originalInvoiceNumber', 'reconciliationInvoiceNumber', 'reconciliationDate', 'creditorNumber'].includes(fieldName)) {
      return !returnItem[fieldName as keyof ReturnItem];
    } 
    // For custom fields, check in returnItem.customFields
    else {
      return !returnItem.customFields || 
             returnItem.customFields[fieldName] === undefined || 
             returnItem.customFields[fieldName] === null || 
             returnItem.customFields[fieldName] === '';
    }
  }) || [];

  const foundCustomFields = targetStep?.requiredFields
    ?.filter(field => !['commissioningDate', 'shippingDate', 'creditDate', 'creditNoteNumber', 'creditAmount', 
                         'originalInvoiceNumber', 'reconciliationInvoiceNumber', 'reconciliationDate', 'creditorNumber'].includes(field))
    ?.map(field => customFields.find(cf => cf.key === field))
    ?.filter(Boolean) || [];

  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="font-medium text-blue-700 mb-2">Debug Information</h3>
      
      <div className="mb-3">
        <p className="text-sm font-medium text-blue-600">Return Item Status: <span className="font-normal">{returnItem.status}</span></p>
        {targetStep && (
          <p className="text-sm font-medium text-blue-600">Target Step: <span className="font-normal">{targetStep.name}</span></p>
        )}
        <p className="text-sm font-medium text-blue-600">Custom Fields Available: <span className="font-normal">{customFields.length}</span></p>
      </div>
      
      {targetStep && (
        <div className="mb-3">
          <p className="text-sm font-medium text-blue-600">Required Fields ({targetStep.requiredFields.length}):</p>
          <ul className="list-disc pl-5 text-xs text-blue-600">
            {targetStep.requiredFields.map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-sm font-medium text-blue-600">Missing Fields ({missingFields.length}):</p>
        <ul className="list-disc pl-5 text-xs text-blue-600">
          {missingFields.map(field => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <p className="text-sm font-medium text-blue-600">Found Custom Field Definitions ({foundCustomFields.length}):</p>
        <ul className="list-disc pl-5 text-xs text-blue-600">
          {foundCustomFields.map(field => (
            <li key={field?.key}>{field?.key}: {field?.type} ({field?.label})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}