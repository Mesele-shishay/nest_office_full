import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { AssignHierarchicalAdminDto } from './dto/user.dto';

describe('UsersController - Hierarchical Admin Endpoints', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    assignHierarchicalAdmin: jest.fn(),
    getHierarchicalAdmins: jest.fn(),
    getHierarchicalAdminsByScope: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignHierarchicalAdmin', () => {
    const assignDto: AssignHierarchicalAdminDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CITY_ADMIN,
      adminScope: '{"cityIds": ["city-1", "city-2"]}',
      isActive: true,
    };

    const mockRequest = {
      user: {
        id: 'assigner-id',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      },
    };

    const mockCreatedUser = {
      id: 'user-id',
      email: assignDto.email,
      firstName: assignDto.firstName,
      lastName: assignDto.lastName,
      role: assignDto.role,
      adminScope: assignDto.adminScope,
      assignedBy: mockRequest.user.id,
      assignedAt: new Date(),
      isActive: assignDto.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully assign a hierarchical admin', async () => {
      mockUsersService.assignHierarchicalAdmin.mockResolvedValue(
        mockCreatedUser,
      );

      const result = await controller.assignHierarchicalAdmin(
        assignDto,
        mockRequest,
      );

      expect(mockUsersService.assignHierarchicalAdmin).toHaveBeenCalledWith(
        assignDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle service errors', async () => {
      const error = new ConflictException('User already exists');
      mockUsersService.assignHierarchicalAdmin.mockRejectedValue(error);

      await expect(
        controller.assignHierarchicalAdmin(assignDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      await expect(
        controller.assignHierarchicalAdmin(assignDto, mockRequest),
      ).rejects.toThrow('User already exists');
    });

    it('should handle validation errors', async () => {
      const error = new BadRequestException('Invalid admin scope');
      mockUsersService.assignHierarchicalAdmin.mockRejectedValue(error);

      await expect(
        controller.assignHierarchicalAdmin(assignDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.assignHierarchicalAdmin(assignDto, mockRequest),
      ).rejects.toThrow('Invalid admin scope');
    });

    it('should work with different admin roles', async () => {
      const countryAdminRequest = {
        user: {
          id: 'country-admin-id',
          role: UserRole.COUNTRY_ADMIN,
          email: 'country@example.com',
        },
      };

      mockUsersService.assignHierarchicalAdmin.mockResolvedValue(
        mockCreatedUser,
      );

      const result = await controller.assignHierarchicalAdmin(
        assignDto,
        countryAdminRequest,
      );

      expect(mockUsersService.assignHierarchicalAdmin).toHaveBeenCalledWith(
        assignDto,
        countryAdminRequest.user.id,
      );
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('getHierarchicalAdmins', () => {
    const mockAdmins = [
      {
        id: '1',
        email: 'city@example.com',
        role: UserRole.CITY_ADMIN,
        adminScope: '{"cityIds": ["city-1"]}',
        assignedBy: 'admin-id',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'state@example.com',
        role: UserRole.STATE_ADMIN,
        adminScope: '{"stateIds": ["state-1"]}',
        assignedBy: 'admin-id',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return hierarchical admins when user is authenticated', async () => {
      const mockRequest = {
        user: {
          id: 'admin-id',
          role: UserRole.ADMIN,
          adminScope: '{"countryIds": ["country-1"]}',
        },
      };

      mockUsersService.getHierarchicalAdminsByScope.mockResolvedValue(
        mockAdmins,
      );

      const result = await controller.getHierarchicalAdmins(
        undefined,
        mockRequest,
      );

      expect(
        mockUsersService.getHierarchicalAdminsByScope,
      ).toHaveBeenCalledWith(UserRole.ADMIN, '{"countryIds": ["country-1"]}');
      expect(result).toEqual(mockAdmins);
    });

    it('should return hierarchical admins for COUNTRY_ADMIN', async () => {
      const mockRequest = {
        user: {
          id: 'country-admin-id',
          role: UserRole.COUNTRY_ADMIN,
          adminScope: '{"countryIds": ["country-1"]}',
        },
      };

      const filteredAdmins = mockAdmins.filter(
        (admin) =>
          admin.role === UserRole.STATE_ADMIN ||
          admin.role === UserRole.CITY_ADMIN,
      );
      mockUsersService.getHierarchicalAdminsByScope.mockResolvedValue(
        filteredAdmins,
      );

      const result = await controller.getHierarchicalAdmins(
        undefined,
        mockRequest,
      );

      expect(
        mockUsersService.getHierarchicalAdminsByScope,
      ).toHaveBeenCalledWith(
        UserRole.COUNTRY_ADMIN,
        '{"countryIds": ["country-1"]}',
      );
      expect(result).toEqual(filteredAdmins);
    });

    it('should return hierarchical admins for STATE_ADMIN', async () => {
      const mockRequest = {
        user: {
          id: 'state-admin-id',
          role: UserRole.STATE_ADMIN,
          adminScope: '{"stateIds": ["state-1"]}',
        },
      };

      const cityAdmins = mockAdmins.filter(
        (admin) => admin.role === UserRole.CITY_ADMIN,
      );
      mockUsersService.getHierarchicalAdminsByScope.mockResolvedValue(
        cityAdmins,
      );

      const result = await controller.getHierarchicalAdmins(
        undefined,
        mockRequest,
      );

      expect(
        mockUsersService.getHierarchicalAdminsByScope,
      ).toHaveBeenCalledWith(UserRole.STATE_ADMIN, '{"stateIds": ["state-1"]}');
      expect(result).toEqual(cityAdmins);
    });

    it('should fallback to getHierarchicalAdmins when no user context', async () => {
      mockUsersService.getHierarchicalAdmins.mockResolvedValue(mockAdmins);

      const result = await controller.getHierarchicalAdmins(undefined, {});

      expect(mockUsersService.getHierarchicalAdmins).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual(mockAdmins);
    });

    it('should filter by role when specified', async () => {
      mockUsersService.getHierarchicalAdmins.mockResolvedValue(mockAdmins);

      const result = await controller.getHierarchicalAdmins('CITY_ADMIN', {});

      expect(mockUsersService.getHierarchicalAdmins).toHaveBeenCalledWith(
        'CITY_ADMIN',
      );
      expect(result).toEqual(mockAdmins);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Permission denied');
      mockUsersService.getHierarchicalAdminsByScope.mockRejectedValue(error);

      const mockRequest = {
        user: {
          id: 'user-id',
          role: UserRole.USER,
          adminScope: '{}',
        },
      };

      await expect(
        controller.getHierarchicalAdmins(undefined, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.getHierarchicalAdmins(undefined, mockRequest),
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('getHierarchicalAdmin', () => {
    const mockAdmin = {
      id: 'admin-id',
      email: 'admin@example.com',
      role: UserRole.CITY_ADMIN,
      adminScope: '{"cityIds": ["city-1"]}',
      assignedBy: 'assigner-id',
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a specific hierarchical admin', async () => {
      mockUsersService.findOne.mockResolvedValue(mockAdmin);

      const result = await controller.getHierarchicalAdmin('admin-id');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('admin-id');
      expect(result).toEqual(mockAdmin);
    });

    it('should handle admin not found', async () => {
      const error = new BadRequestException('Admin not found');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(
        controller.getHierarchicalAdmin('non-existent-id'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.getHierarchicalAdmin('non-existent-id'),
      ).rejects.toThrow('Admin not found');
    });

    it('should handle invalid UUID', async () => {
      const error = new BadRequestException('Invalid UUID format');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(
        controller.getHierarchicalAdmin('invalid-uuid'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.getHierarchicalAdmin('invalid-uuid'),
      ).rejects.toThrow('Invalid UUID format');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete hierarchical admin assignment flow', async () => {
      const assignDto: AssignHierarchicalAdminDto = {
        email: 'new-admin@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.STATE_ADMIN,
        adminScope: '{"stateIds": ["state-1", "state-2"]}',
        isActive: true,
      };

      const mockRequest = {
        user: {
          id: 'country-admin-id',
          role: UserRole.COUNTRY_ADMIN,
          email: 'country@example.com',
        },
      };

      const createdAdmin = {
        id: 'new-admin-id',
        ...assignDto,
        assignedBy: mockRequest.user.id,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.assignHierarchicalAdmin.mockResolvedValue(createdAdmin);

      // Assign the admin
      const assignResult = await controller.assignHierarchicalAdmin(
        assignDto,
        mockRequest,
      );
      expect(assignResult).toEqual(createdAdmin);

      // Retrieve the admin
      mockUsersService.findOne.mockResolvedValue(createdAdmin);
      const retrieveResult =
        await controller.getHierarchicalAdmin('new-admin-id');
      expect(retrieveResult).toEqual(createdAdmin);

      // List all admins
      mockUsersService.getHierarchicalAdminsByScope.mockResolvedValue([
        createdAdmin,
      ]);
      const listResult = await controller.getHierarchicalAdmins(
        undefined,
        mockRequest,
      );
      expect(listResult).toEqual([createdAdmin]);
    });
  });
});
