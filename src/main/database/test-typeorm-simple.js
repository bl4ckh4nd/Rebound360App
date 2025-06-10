// Simple JavaScript test file to verify TypeORM setup
const path = require('path');

// Mock electron app path
if (!global.app) {
  global.app = {
    getPath: (name) => {
      if (name === 'userData') {
        return path.join(__dirname, '../../../');
      }
      return __dirname;
    }
  };
}

async function testTypeORM() {
  console.log('🧪 Testing TypeORM Setup (Simple Test)...\n');

  try {
    // Test 1: Check if TypeORM is installed
    console.log('1️⃣  Checking TypeORM installation...');
    const typeorm = require('typeorm');
    console.log('✅ TypeORM is installed!');

    // Test 2: Check if reflect-metadata is available
    console.log('\n2️⃣  Checking reflect-metadata...');
    require('reflect-metadata');
    console.log('✅ reflect-metadata is available!');

    // Test 3: Check if better-sqlite3 is available
    console.log('\n3️⃣  Checking better-sqlite3...');
    const Database = require('better-sqlite3');
    console.log('✅ better-sqlite3 is available!');

    // Test 4: Check if database file exists
    console.log('\n4️⃣  Checking database file...');
    const dbPath = path.join(__dirname, '../../../supplier_returns.db');
    const fs = require('fs');
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database file exists at:', dbPath);
      
      // Test 5: Try to connect with better-sqlite3
      console.log('\n5️⃣  Testing database connection...');
      const db = new Database(dbPath, { readonly: true });
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(`✅ Database has ${tables.length} tables`);
      console.log('   First 5 tables:', tables.slice(0, 5).map(t => t.name).join(', '));
      db.close();
    } else {
      console.log('⚠️  Database file not found at:', dbPath);
    }

    console.log('\n🎉 Basic checks passed! TypeORM dependencies are properly installed.\n');
    console.log('Next steps:');
    console.log('1. The TypeScript compilation issues need to be resolved');
    console.log('2. Then the full TypeORM integration can be tested');
    console.log('3. Start migrating API endpoints to use the new repositories\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testTypeORM();