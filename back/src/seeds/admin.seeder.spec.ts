import { DataSource, Repository } from 'typeorm';
import { AdminSeeder } from './admin.seeder';
import { User, UserRole } from '../users/entities/user.entity';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('AdminSeeder', () => {
  let seeder: AdminSeeder;
  let mockDataSource: DataSource;
  let mockRepository: Repository<User>;

  beforeEach(() => {
    seeder = new AdminSeeder();

    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
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

  describe('run', () => {
    it('should create admin user when none exists', async () => {
      const mockAdmin = {
        id: 'admin-uuid',
        email: 'admin@office.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAdmin);
      mockRepository.save.mockResolvedValue(mockAdmin);

      await seeder.run(mockDataSource);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@tugza.tech' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'admin@office.com',
        password: 'Admin@123456',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAdmin);
      expect(console.log).toHaveBeenCalledWith(
        '✅ Admin user created successfully!',
      );
      expect(console.log).toHaveBeenCalledWith('📧 Email: admin@office.com');
      expect(console.log).toHaveBeenCalledWith('🔑 Password: Admin@123456');
      expect(console.log).toHaveBeenCalledWith(
        '⚠️  Please change the password after first login!',
      );
    });

    it('should skip creation when admin already exists', async () => {
      const existingAdmin = {
        id: 'existing-uuid',
        email: 'admin@office.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(existingAdmin);

      await seeder.run(mockDataSource);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@tugza.tech' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Admin user already exists. Skipping...',
      );
    });

    it('should handle database errors during findOne', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(seeder.run(mockDataSource)).rejects.toThrow(error);
    });

    it('should handle database errors during save', async () => {
      const mockAdmin = {
        id: 'admin-uuid',
        email: 'admin@office.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      };

      const error = new Error('Save failed');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAdmin);
      mockRepository.save.mockRejectedValue(error);

      await expect(seeder.run(mockDataSource)).rejects.toThrow(error);
    });

    it('should handle repository creation errors', async () => {
      const error = new Error('Repository creation failed');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation(() => {
        throw error;
      });

      await expect(seeder.run(mockDataSource)).rejects.toThrow(error);
    });

    it('should create admin with correct properties', async () => {
      const mockAdmin = {
        id: 'admin-uuid',
        email: 'admin@office.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAdmin);
      mockRepository.save.mockResolvedValue(mockAdmin);

      await seeder.run(mockDataSource);

      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'admin@office.com',
        password: 'Admin@123456',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      });
    });

    it('should use correct repository', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      await seeder.run(mockDataSource);

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(User);
    });
  });
});
