const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  let connection;

  try {
    // First connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('🔌 Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Running schema migration...');
    await connection.query(schema);
    console.log('✅ Schema migration completed successfully!');

    // Check if seed flag is passed
    if (process.argv.includes('--seed')) {
      const seedPath = path.join(__dirname, 'seed.sql');
      const seed = fs.readFileSync(seedPath, 'utf8');

      console.log('🌱 Running seed data...');
      await connection.query(seed);
      console.log('✅ Seed data inserted successfully!');
    }

    // Verify tables
    await connection.query('USE ai_resume_analyzer');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   • ${tableName}`);
    });

    console.log('\n🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure MySQL server is running');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

migrate();
