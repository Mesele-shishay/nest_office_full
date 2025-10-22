import { DataSource } from 'typeorm';
import { FeaturesSeeder } from './features.seeder';

async function runSeeders() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'app_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');

    // Run features seeder
    const featuresSeeder = new FeaturesSeeder(dataSource);
    await featuresSeeder.seed();

    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };
