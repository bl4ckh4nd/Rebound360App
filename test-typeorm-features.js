#!/usr/bin/env node

// Use built-in fetch in Node.js 18+

const API_BASE_URL = 'http://localhost:3001/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCustomFields() {
  console.log('🧪 Testing TypeORM Custom Fields Feature...\n');
  
  try {
    // Test 1: Get all custom fields
    console.log('1️⃣ Testing GET /api/settings/custom-fields');
    const getAllResponse = await fetch(`${API_BASE_URL}/settings/custom-fields`);
    const allFields = await getAllResponse.json();
    console.log(`✅ Retrieved ${allFields.length} custom fields`);
    
    // Test 2: Create a new custom field
    console.log('\n2️⃣ Testing POST /api/settings/custom-fields');
    const newField = {
      key: 'test_typeorm_field',
      label: 'Test TypeORM Field',
      type: 'text',
      description: 'Testing TypeORM integration',
      required: false,
      isActive: true,
      sortOrder: 100
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/settings/custom-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newField)
    });
    
    if (createResponse.ok) {
      const createdField = await createResponse.json();
      console.log(`✅ Created custom field with ID: ${createdField.id}`);
      
      // Test 3: Get the specific field
      console.log('\n3️⃣ Testing GET /api/settings/custom-fields/:id');
      const getOneResponse = await fetch(`${API_BASE_URL}/settings/custom-fields/${createdField.id}`);
      const retrievedField = await getOneResponse.json();
      console.log(`✅ Retrieved field: ${retrievedField.label}`);
      
      // Test 4: Update the field
      console.log('\n4️⃣ Testing PUT /api/settings/custom-fields/:id');
      const updateResponse = await fetch(`${API_BASE_URL}/settings/custom-fields/${createdField.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'Updated TypeORM Field' })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Field updated successfully');
      }
      
      // Test 5: Get active fields only
      console.log('\n5️⃣ Testing GET /api/settings/custom-fields/active');
      const activeResponse = await fetch(`${API_BASE_URL}/settings/custom-fields/active`);
      const activeFields = await activeResponse.json();
      console.log(`✅ Retrieved ${activeFields.length} active fields`);
      
      // Test 6: Get fields with usage stats
      console.log('\n6️⃣ Testing GET /api/settings/custom-fields/usage-stats');
      const usageResponse = await fetch(`${API_BASE_URL}/settings/custom-fields/usage-stats`);
      const fieldsWithUsage = await usageResponse.json();
      console.log(`✅ Retrieved ${fieldsWithUsage.length} fields with usage stats`);
      
      // Test 7: Delete the test field
      console.log('\n7️⃣ Testing DELETE /api/settings/custom-fields/:id');
      const deleteResponse = await fetch(`${API_BASE_URL}/settings/custom-fields/${createdField.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Field deleted successfully');
      }
    } else {
      const error = await createResponse.text();
      console.error(`❌ Failed to create field: ${error}`);
    }
    
    // Test 8: Check monitoring endpoint
    console.log('\n8️⃣ Testing Monitoring Endpoints');
    const healthResponse = await fetch(`${API_BASE_URL}/monitoring/health`);
    const health = await healthResponse.json();
    console.log(`✅ Database health: ${health.status}`);
    console.log(`   TypeORM: ${health.typeorm.initialized ? 'Connected' : 'Not connected'}`);
    console.log(`   SQLite: ${health.sqlite.connected ? 'Connected' : 'Not connected'}`);
    
    // Test 9: Check feature flags
    const flagsResponse = await fetch(`${API_BASE_URL}/monitoring/feature-flags`);
    const flags = await flagsResponse.json();
    console.log('\n📊 Feature Flags Status:');
    Object.entries(flags).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    });
    
    // Test 10: Performance comparison
    console.log('\n⚡ Testing Performance Comparison');
    const perfResponse = await fetch(`${API_BASE_URL}/monitoring/performance`);
    const perf = await perfResponse.json();
    console.log(`   TypeORM Average: ${perf.typeorm.averageMs.toFixed(2)}ms`);
    console.log(`   SQLite Average: ${perf.sqlite.averageMs.toFixed(2)}ms`);
    console.log(`   Performance Overhead: ${((perf.typeorm.averageMs / perf.sqlite.averageMs - 1) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the application is running on port 3001');
    }
  }
}

// Wait a bit for the server to start
console.log('⏳ Waiting for server to start...\n');
setTimeout(() => {
  testCustomFields().then(() => {
    console.log('\n✅ Custom Fields TypeORM testing complete!');
  });
}, 3000);