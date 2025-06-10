import 'reflect-metadata';
import { initializeTypeORM, closeTypeORM } from './typeorm-config';
import { getSupplierReturnRepository, getAppSettingRepository } from './repositories';

/**
 * Test script to verify TypeORM is working correctly
 * Run with: npm run test:typeorm
 */
async function testTypeORMSetup() {
  console.log('🧪 Testing TypeORM Setup...\n');

  try {
    // 1. Initialize TypeORM
    console.log('1️⃣  Initializing TypeORM...');
    await initializeTypeORM();
    console.log('✅ TypeORM initialized successfully!\n');

    // 2. Test simple entity (AppSetting)
    console.log('2️⃣  Testing AppSetting repository...');
    const settingRepo = getAppSettingRepository();
    
    // Try to find all settings
    const settings = await settingRepo.find();
    console.log(`✅ Found ${settings.length} settings in database\n`);

    // 3. Test complex entity with relations (SupplierReturn)
    console.log('3️⃣  Testing SupplierReturn repository...');
    const returnRepo = getSupplierReturnRepository();
    
    // Test TypeORM query
    const returns = await returnRepo.findAll({ take: 5 });
    console.log(`✅ Found ${returns.length} returns using TypeORM\n`);

    // 4. Test hybrid approach - complex aggregation query
    console.log('4️⃣  Testing hybrid approach with complex query...');
    const aggregatedReturns = await returnRepo.getReturnsWithAggregatedData();
    console.log(`✅ Retrieved ${aggregatedReturns.length} returns with aggregated data\n`);

    // 5. Test statistics query
    console.log('5️⃣  Testing statistics query...');
    const stats = await returnRepo.getStatistics();
    console.log('✅ Statistics retrieved:');
    console.log(`   Total Returns: ${stats.totalReturns}`);
    console.log(`   By Status: ${JSON.stringify(stats.byStatus)}`);
    console.log(`   By Action: ${JSON.stringify(stats.byFollowUpAction)}\n`);

    console.log('🎉 All tests passed! TypeORM is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    console.log('🔌 Closing TypeORM connection...');
    await closeTypeORM();
    console.log('✅ Connection closed.\n');
  }
}

// Run the test
if (require.main === module) {
  testTypeORMSetup().then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}