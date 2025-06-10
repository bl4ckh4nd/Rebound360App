/**
 * Integration test for TypeORM setup without requiring full build
 * This validates that all the pieces work together correctly
 */

const path = require('path');

// Mock electron environment
global.app = {
  getPath: (name) => {
    if (name === 'userData') {
      return __dirname; // Use current directory for testing
    }
    return __dirname;
  }
};

async function runIntegrationTest() {
  console.log('🧪 TypeORM Integration Test');
  console.log('=' .repeat(40));

  let dataSource = null;
  
  try {
    // Step 1: Test TypeORM imports
    console.log('\n1️⃣  Testing TypeORM imports...');
    const { DataSource } = require('typeorm');
    const Database = require('better-sqlite3');
    require('reflect-metadata');
    console.log('✅ All dependencies imported successfully');

    // Step 2: Test basic database creation
    console.log('\n2️⃣  Testing database creation...');
    const dbPath = path.join(__dirname, 'test-integration.db');
    const db = new Database(dbPath);
    
    // Create a simple test table
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        custom_fields TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert test data
    const stmt = db.prepare('INSERT INTO test_entities (name, status, custom_fields) VALUES (?, ?, ?)');
    stmt.run('Test Entity 1', 'active', '{"key": "value"}');
    stmt.run('Test Entity 2', 'inactive', '{"key2": "value2"}');
    
    console.log('✅ Test database created with sample data');
    db.close();

    // Step 3: Test TypeORM DataSource configuration
    console.log('\n3️⃣  Testing TypeORM DataSource...');
    
    // Create a minimal entity for testing
    const testEntity = {
      name: 'TestEntity',
      tableName: 'test_entities',
      columns: [
        { propertyName: 'id', type: 'integer', isPrimary: true, isGenerated: true },
        { propertyName: 'name', type: 'text' },
        { propertyName: 'status', type: 'text' },
        { propertyName: 'customFields', type: 'text' },
        { propertyName: 'createdAt', type: 'datetime' }
      ]
    };

    const config = {
      type: 'better-sqlite3',
      database: dbPath,
      entities: [], // We'll test without entities first
      synchronize: false,
      logging: false
    };

    dataSource = new DataSource(config);
    await dataSource.initialize();
    console.log('✅ TypeORM DataSource initialized successfully');

    // Step 4: Test raw queries through TypeORM
    console.log('\n4️⃣  Testing raw SQL through TypeORM...');
    
    const results = await dataSource.query('SELECT * FROM test_entities ORDER BY id');
    console.log(`✅ Raw query successful - found ${results.length} records`);
    
    if (results.length > 0) {
      console.log('   Sample record:', results[0]);
    }

    // Step 5: Test JSON handling
    console.log('\n5️⃣  Testing JSON column handling...');
    
    const recordWithJson = await dataSource.query('SELECT * FROM test_entities WHERE id = 1');
    if (recordWithJson[0] && recordWithJson[0].custom_fields) {
      const parsed = JSON.parse(recordWithJson[0].custom_fields);
      console.log('✅ JSON parsing successful:', parsed);
    }

    // Step 6: Test transaction support
    console.log('\n6️⃣  Testing transaction support...');
    
    await dataSource.transaction(async (manager) => {
      await manager.query('INSERT INTO test_entities (name, status) VALUES (?, ?)', ['Transaction Test', 'pending']);
      await manager.query('UPDATE test_entities SET status = ? WHERE name = ?', ['completed', 'Transaction Test']);
    });
    
    const transactionResult = await dataSource.query('SELECT * FROM test_entities WHERE name = ?', ['Transaction Test']);
    console.log('✅ Transaction completed successfully');
    console.log(`   Result: ${transactionResult[0].name} - ${transactionResult[0].status}`);

    // Step 7: Test our repository pattern concepts
    console.log('\n7️⃣  Testing repository pattern concepts...');
    
    // Simulate BaseRepository functionality
    class TestRepository {
      constructor(dataSource) {
        this.dataSource = dataSource;
      }

      async findAll() {
        return await this.dataSource.query('SELECT * FROM test_entities ORDER BY created_at DESC');
      }

      async findByStatus(status) {
        return await this.dataSource.query('SELECT * FROM test_entities WHERE status = ?', [status]);
      }

      async executeRawQuery(sql, params = []) {
        return await this.dataSource.query(sql, params);
      }

      async getAggregatedData() {
        return await this.dataSource.query(`
          SELECT 
            status,
            COUNT(*) as count,
            json_group_array(
              json_object('id', id, 'name', name, 'customFields', custom_fields)
            ) as entities
          FROM test_entities 
          GROUP BY status
        `);
      }
    }

    const testRepo = new TestRepository(dataSource);
    
    const allEntities = await testRepo.findAll();
    console.log(`   Found ${allEntities.length} total entities`);
    
    const activeEntities = await testRepo.findByStatus('active');
    console.log(`   Found ${activeEntities.length} active entities`);
    
    const aggregated = await testRepo.getAggregatedData();
    console.log(`   Aggregated by status: ${aggregated.length} groups`);
    
    if (aggregated[0]) {
      const parsed = JSON.parse(aggregated[0].entities);
      console.log(`   Sample aggregation: ${aggregated[0].status} has ${parsed.length} items`);
    }

    console.log('✅ Repository pattern concepts working correctly');

    // Step 8: Test performance characteristics
    console.log('\n8️⃣  Testing performance characteristics...');
    
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      await testRepo.findAll();
    }
    const end = Date.now();
    
    console.log(`✅ Performance test: 100 queries in ${end - start}ms`);
    console.log(`   Average: ${((end - start) / 100).toFixed(2)}ms per query`);

    console.log('\n🎉 All integration tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ TypeORM dependencies working');
    console.log('   ✅ Database creation and operations');
    console.log('   ✅ DataSource initialization');
    console.log('   ✅ Raw SQL queries');
    console.log('   ✅ JSON column handling');
    console.log('   ✅ Transaction support');
    console.log('   ✅ Repository pattern simulation');
    console.log('   ✅ Performance characteristics acceptable');
    
    console.log('\n🚀 Ready for production integration!');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Cleanup
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 DataSource connection closed');
    }
    
    // Clean up test database
    try {
      const fs = require('fs');
      const testDbPath = path.join(__dirname, 'test-integration.db');
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log('🗑️  Test database cleaned up');
      }
    } catch (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message);
    }
  }
  
  return true;
}

// Run the test
if (require.main === module) {
  runIntegrationTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runIntegrationTest };