import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import dataSource from '../../typeorm.config';
import { AdminSeeder } from './admin.seeder';

// Load environment variables
config();

export async function runSeeders(): Promise<void> {
  let connection: DataSource | null = null;

  try {
    // Initialize database connection
    console.log('🔄 Initializing database connection...');
    connection = await dataSource.initialize();
    console.log('✅ Database connection established');

    // Run admin seeder
    console.log('\n🌱 Running Admin Seeder...');
    const adminSeeder = new AdminSeeder();
    await adminSeeder.run(connection);

    console.log('\n✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection?.isInitialized) {
      await connection.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Execute seeders only if this file is run directly
if (require.main === module) {
  void runSeeders();
}
