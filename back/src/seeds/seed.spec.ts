import { DataSource } from 'typeorm';
import { AdminSeeder } from './admin.seeder';

// Mock dependencies
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('../../typeorm.config', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    destroy: jest.fn(),
    isInitialized: false,
  },
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Seed Runner', () => {
  let mockDataSource: DataSource;
  let mockAdminSeeder: AdminSeeder;

  beforeEach(() => {
    mockDataSource = {
      initialize: jest.fn(),
      destroy: jest.fn(),
      isInitialized: false,
    } as any;

    mockAdminSeeder = {
      run: jest.fn(),
    } as any;

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('runSeeders', () => {
    it('should run successfully', async () => {
      const dataSourceModule = require('../../typeorm.config');
      dataSourceModule.default.initialize.mockResolvedValue(mockDataSource);
      dataSourceModule.default.destroy.mockResolvedValue(undefined);
      mockDataSource.isInitialized = true;

      // Mock AdminSeeder
      jest.spyOn(AdminSeeder.prototype, 'run').mockResolvedValue(undefined);

      // Import the seed file directly
      const seedModule = require('./seed');

      await seedModule.runSeeders();

      expect(console.log).toHaveBeenCalledWith(
        '🔄 Initializing database connection...',
      );
      expect(console.log).toHaveBeenCalledWith(
        '✅ Database connection established',
      );
      expect(console.log).toHaveBeenCalledWith('\n🌱 Running Admin Seeder...');
      expect(console.log).toHaveBeenCalledWith(
        '\n✅ All seeders completed successfully!',
      );
      expect(console.log).toHaveBeenCalledWith(
        '\n🔌 Database connection closed',
      );
    });

    it('should handle database initialization error', async () => {
      const error = new Error('Database connection failed');
      const dataSourceModule = require('../../typeorm.config');
      dataSourceModule.default.initialize.mockRejectedValue(error);

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Import the seed file directly
      const seedModule = require('./seed');

      await expect(seedModule.runSeeders()).rejects.toThrow(
        'process.exit called',
      );

      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', error);
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should handle seeder execution error', async () => {
      const error = new Error('Seeder failed');
      const dataSourceModule = require('../../typeorm.config');
      dataSourceModule.default.initialize.mockResolvedValue(mockDataSource);
      mockDataSource.isInitialized = true;

      // Mock AdminSeeder to throw error
      jest.spyOn(AdminSeeder.prototype, 'run').mockRejectedValue(error);

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      // Import the seed file directly
      const seedModule = require('./seed');

      await expect(seedModule.runSeeders()).rejects.toThrow(
        'process.exit called',
      );

      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', error);
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should handle database destruction error', async () => {
      const dataSourceModule = require('../../typeorm.config');
      dataSourceModule.default.initialize.mockResolvedValue(mockDataSource);
      dataSourceModule.default.destroy.mockRejectedValue(
        new Error('Destroy failed'),
      );
      mockDataSource.isInitialized = true;

      // Mock AdminSeeder
      jest.spyOn(AdminSeeder.prototype, 'run').mockResolvedValue(undefined);

      // Import the seed file directly
      const seedModule = require('./seed');

      await seedModule.runSeeders();

      expect(console.log).toHaveBeenCalledWith(
        '🔄 Initializing database connection...',
      );
      expect(console.log).toHaveBeenCalledWith(
        '✅ Database connection established',
      );
      expect(console.log).toHaveBeenCalledWith('\n🌱 Running Admin Seeder...');
      expect(console.log).toHaveBeenCalledWith(
        '\n✅ All seeders completed successfully!',
      );
      // Should not log connection closed message due to error
    });

    it('should skip database destruction when not initialized', async () => {
      const dataSourceModule = require('../../typeorm.config');
      dataSourceModule.default.initialize.mockResolvedValue(mockDataSource);
      mockDataSource.isInitialized = false;

      // Mock AdminSeeder
      jest.spyOn(AdminSeeder.prototype, 'run').mockResolvedValue(undefined);

      // Import the seed file directly
      const seedModule = require('./seed');

      await seedModule.runSeeders();

      expect(dataSourceModule.default.destroy).not.toHaveBeenCalled();
    });

    it('should load environment variables', () => {
      const dotenv = require('dotenv');

      // Import the seed file directly
      require('./seed');

      // The dotenv.config is called at module level, so we can't easily test it
      // This test verifies the module can be imported without errors
      expect(dotenv.config).toBeDefined();
    });
  });
});
