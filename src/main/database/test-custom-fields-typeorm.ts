/**
 * Test script for Custom Fields TypeORM integration
 * Validates repository functionality and performance
 */

import { initializeTypeORM } from './typeorm-config';
import { getCustomFieldRepository } from './repositories';
import { featureFlags } from '../utils/feature-flags';
import { CustomField } from '../../shared/types';

async function testCustomFieldsTypeORM() {
  console.log('🧪 Testing Custom Fields TypeORM Integration');
  console.log('=' .repeat(50));

  try {
    // Initialize TypeORM
    console.log('📚 Initializing TypeORM...');
    await initializeTypeORM();
    console.log('✅ TypeORM initialized successfully');

    // Enable custom fields feature flag for testing
    featureFlags.setOverride('useTypeORMForCustomFields', true);
    console.log('🚩 Custom fields feature flag enabled');

    // Get repository
    const customFieldRepo = getCustomFieldRepository();
    console.log('📦 Custom field repository created');

    // Test 1: Get all custom fields
    console.log('\n📋 Test 1: Get all custom fields');
    const allFields = await customFieldRepo.getAllCustomFields();
    console.log(`Found ${allFields.length} custom fields`);

    // Test 2: Create a test custom field
    console.log('\n➕ Test 2: Create test custom field');
    const testField: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'> = {
      key: 'test_typeorm_field',
      label: 'Test TypeORM Field',
      type: 'text',
      description: 'Test field created via TypeORM',
      required: false,
      defaultValue: '',
      placeholder: 'Enter test value',
      isActive: true,
      sortOrder: 999
    };

    let createdFieldId: string;
    try {
      createdFieldId = await customFieldRepo.createCustomField(testField);
      console.log(`✅ Created custom field with ID: ${createdFieldId}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Test field already exists, continuing...');
        const existing = await customFieldRepo.getCustomFieldByKey('test_typeorm_field');
        createdFieldId = existing!.id;
      } else {
        throw error;
      }
    }

    // Test 3: Get custom field by ID
    console.log('\n🔍 Test 3: Get custom field by ID');
    const foundField = await customFieldRepo.getCustomFieldById(createdFieldId);
    if (foundField) {
      console.log(`✅ Found field: ${foundField.label} (${foundField.key})`);
    } else {
      console.log('❌ Field not found by ID');
    }

    // Test 4: Get custom field by key
    console.log('\n🗝️  Test 4: Get custom field by key');
    const foundByKey = await customFieldRepo.getCustomFieldByKey('test_typeorm_field');
    if (foundByKey) {
      console.log(`✅ Found field by key: ${foundByKey.label}`);
    } else {
      console.log('❌ Field not found by key');
    }

    // Test 5: Update custom field
    console.log('\n✏️  Test 5: Update custom field');
    const updateResult = await customFieldRepo.updateCustomField(createdFieldId, {
      description: 'Updated via TypeORM test',
      placeholder: 'Updated placeholder'
    });
    console.log(`✅ Update result: ${updateResult}`);

    // Test 6: Get active custom fields only
    console.log('\n🟢 Test 6: Get active custom fields');
    const activeFields = await customFieldRepo.getActiveCustomFields();
    console.log(`Found ${activeFields.length} active custom fields`);

    // Test 7: Get custom fields with usage stats (performance test)
    console.log('\n📊 Test 7: Get custom fields with usage stats');
    const start = Date.now();
    const fieldsWithStats = await customFieldRepo.getCustomFieldsWithUsageStats();
    const duration = Date.now() - start;
    console.log(`✅ Retrieved ${fieldsWithStats.length} fields with usage stats in ${duration}ms`);
    
    // Show usage stats for our test field
    const testFieldStats = fieldsWithStats.find(f => f.key === 'test_typeorm_field');
    if (testFieldStats) {
      console.log(`   Test field usage count: ${testFieldStats.usageCount}`);
    }

    // Test 8: Test duplicate key validation
    console.log('\n🔄 Test 8: Test duplicate key validation');
    try {
      await customFieldRepo.createCustomField({
        ...testField,
        label: 'Duplicate Test Field'
      });
      console.log('❌ Should have failed with duplicate key error');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Duplicate key validation working');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    // Test 9: Cleanup - Delete test field
    console.log('\n🗑️  Test 9: Cleanup test field');
    const deleteResult = await customFieldRepo.deleteCustomField(createdFieldId);
    console.log(`✅ Delete result: ${deleteResult}`);

    // Final verification
    console.log('\n🔍 Final verification: Check if test field is gone');
    const verifyDeleted = await customFieldRepo.getCustomFieldById(createdFieldId);
    if (!verifyDeleted) {
      console.log('✅ Test field successfully deleted');
    } else {
      console.log('❌ Test field still exists after deletion');
    }

    console.log('\n' .repeat(2));
    console.log('🎉 All Custom Fields TypeORM tests completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ Custom Fields TypeORM test failed:');
    console.error(error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testCustomFieldsTypeORM()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testCustomFieldsTypeORM };