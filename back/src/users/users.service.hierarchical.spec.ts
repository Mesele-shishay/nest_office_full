import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { AssignHierarchicalAdminDto } from './dto/user.dto';

describe('UsersService - Hierarchical Admin Methods', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
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

    const assignedByUserId = 'assigner-id';

    it('should successfully assign a hierarchical admin', async () => {
      const mockUser = {
        id: 'user-id',
        email: assignDto.email,
        firstName: assignDto.firstName,
        lastName: assignDto.lastName,
        role: assignDto.role,
        adminScope: assignDto.adminScope,
        assignedBy: assignedByUserId,
        assignedAt: expect.any(Date),
        isActive: assignDto.isActive,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.assignHierarchicalAdmin(
        assignDto,
        assignedByUserId,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: assignDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: assignDto.email,
        password: assignDto.password,
        firstName: assignDto.firstName,
        lastName: assignDto.lastName,
        role: assignDto.role,
        adminScope: assignDto.adminScope,
        assignedBy: assignedByUserId,
        assignedAt: expect.any(Date),
        isActive: assignDto.isActive,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when user already exists', async () => {
      const existingUser = { id: 'existing-id', email: assignDto.email };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.assignHierarchicalAdmin(assignDto, assignedByUserId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.assignHierarchicalAdmin(assignDto, assignedByUserId),
      ).rejects.toThrow(`User with email ${assignDto.email} already exists`);
    });

    it('should throw BadRequestException for invalid admin scope JSON', async () => {
      const invalidDto = { ...assignDto, adminScope: 'invalid-json' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow('Invalid admin scope JSON format');
    });

    it('should throw BadRequestException for CITY_ADMIN with invalid scope', async () => {
      const invalidDto = {
        ...assignDto,
        adminScope: '{"stateIds": ["state-1"]}',
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow('City admin must have at least one city ID in scope');
    });

    it('should throw BadRequestException for STATE_ADMIN with invalid scope', async () => {
      const invalidDto = {
        ...assignDto,
        role: UserRole.STATE_ADMIN,
        adminScope: '{"cityIds": ["city-1"]}',
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow('State admin must have at least one state ID in scope');
    });

    it('should throw BadRequestException for COUNTRY_ADMIN with invalid scope', async () => {
      const invalidDto = {
        ...assignDto,
        role: UserRole.COUNTRY_ADMIN,
        adminScope: '{"cityIds": ["city-1"]}',
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.assignHierarchicalAdmin(invalidDto, assignedByUserId),
      ).rejects.toThrow(
        'Country admin must have at least one country ID in scope',
      );
    });

    it('should use default password when not provided', async () => {
      const dtoWithoutPassword = { ...assignDto, password: undefined };
      const mockUser = { id: 'user-id', ...dtoWithoutPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue('default-password');

      await service.assignHierarchicalAdmin(
        dtoWithoutPassword,
        assignedByUserId,
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'default-password',
        }),
      );
    });

    it('should use fallback default password when config is not set', async () => {
      const dtoWithoutPassword = { ...assignDto, password: undefined };
      const mockUser = { id: 'user-id', ...dtoWithoutPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue(undefined);

      await service.assignHierarchicalAdmin(
        dtoWithoutPassword,
        assignedByUserId,
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'DefaultPass123!',
        }),
      );
    });
  });

  describe('getHierarchicalAdmins', () => {
    const mockAdmins = [
      { id: '1', role: UserRole.CITY_ADMIN, email: 'city@example.com' },
      { id: '2', role: UserRole.STATE_ADMIN, email: 'state@example.com' },
      { id: '3', role: UserRole.COUNTRY_ADMIN, email: 'country@example.com' },
    ];

    it('should return all hierarchical admins when no role specified', async () => {
      mockUserRepository.find.mockResolvedValue(mockAdmins);

      const result = await service.getHierarchicalAdmins();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          role: [
            UserRole.CITY_ADMIN,
            UserRole.STATE_ADMIN,
            UserRole.COUNTRY_ADMIN,
          ],
        },
        relations: ['office'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAdmins);
    });

    it('should return filtered admins when role specified', async () => {
      const cityAdmins = mockAdmins.filter(
        (admin) => admin.role === UserRole.CITY_ADMIN,
      );
      mockUserRepository.find.mockResolvedValue(cityAdmins);

      const result = await service.getHierarchicalAdmins(UserRole.CITY_ADMIN);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { role: [UserRole.CITY_ADMIN] },
        relations: ['office'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(cityAdmins);
    });
  });

  describe('getHierarchicalAdminsByScope', () => {
    const mockAdmins = [
      { id: '1', role: UserRole.CITY_ADMIN, email: 'city@example.com' },
      { id: '2', role: UserRole.STATE_ADMIN, email: 'state@example.com' },
    ];

    it('should return all hierarchical admins for ADMIN role', async () => {
      mockUserRepository.find.mockResolvedValue(mockAdmins);

      const result = await service.getHierarchicalAdminsByScope(
        UserRole.ADMIN,
        '{"countryIds": ["country-1"]}',
      );

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          role: [
            UserRole.CITY_ADMIN,
            UserRole.STATE_ADMIN,
            UserRole.COUNTRY_ADMIN,
          ],
        },
        relations: ['office'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAdmins);
    });

    it('should return state and city admins for COUNTRY_ADMIN role', async () => {
      const stateAndCityAdmins = mockAdmins.filter(
        (admin) =>
          admin.role === UserRole.STATE_ADMIN ||
          admin.role === UserRole.CITY_ADMIN,
      );
      mockUserRepository.find.mockResolvedValue(stateAndCityAdmins);

      const result = await service.getHierarchicalAdminsByScope(
        UserRole.COUNTRY_ADMIN,
        '{"countryIds": ["country-1"]}',
      );

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          role: [UserRole.STATE_ADMIN, UserRole.CITY_ADMIN],
        },
        relations: ['office'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(stateAndCityAdmins);
    });

    it('should return city admins for STATE_ADMIN role', async () => {
      const cityAdmins = mockAdmins.filter(
        (admin) => admin.role === UserRole.CITY_ADMIN,
      );
      mockUserRepository.find.mockResolvedValue(cityAdmins);

      const result = await service.getHierarchicalAdminsByScope(
        UserRole.STATE_ADMIN,
        '{"stateIds": ["state-1"]}',
      );

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          role: UserRole.CITY_ADMIN,
        },
        relations: ['office'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(cityAdmins);
    });

    it('should throw BadRequestException for invalid user role', async () => {
      await expect(
        service.getHierarchicalAdminsByScope(UserRole.USER, '{}'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getHierarchicalAdminsByScope(UserRole.USER, '{}'),
      ).rejects.toThrow(
        'User does not have permission to view hierarchical admins',
      );
    });
  });

  describe('canAssignRole', () => {
    it('should return correct permissions for ADMIN', async () => {
      expect(
        await service.canAssignRole(UserRole.ADMIN, UserRole.COUNTRY_ADMIN),
      ).toBe(true);
      expect(
        await service.canAssignRole(UserRole.ADMIN, UserRole.STATE_ADMIN),
      ).toBe(true);
      expect(
        await service.canAssignRole(UserRole.ADMIN, UserRole.CITY_ADMIN),
      ).toBe(true);
      expect(await service.canAssignRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(
        false,
      );
      expect(
        await service.canAssignRole(UserRole.ADMIN, UserRole.MANAGER),
      ).toBe(false);
      expect(await service.canAssignRole(UserRole.ADMIN, UserRole.USER)).toBe(
        false,
      );
    });

    it('should return correct permissions for COUNTRY_ADMIN', async () => {
      expect(
        await service.canAssignRole(
          UserRole.COUNTRY_ADMIN,
          UserRole.STATE_ADMIN,
        ),
      ).toBe(true);
      expect(
        await service.canAssignRole(
          UserRole.COUNTRY_ADMIN,
          UserRole.CITY_ADMIN,
        ),
      ).toBe(true);
      expect(
        await service.canAssignRole(
          UserRole.COUNTRY_ADMIN,
          UserRole.COUNTRY_ADMIN,
        ),
      ).toBe(false);
      expect(
        await service.canAssignRole(UserRole.COUNTRY_ADMIN, UserRole.ADMIN),
      ).toBe(false);
    });

    it('should return correct permissions for STATE_ADMIN', async () => {
      expect(
        await service.canAssignRole(UserRole.STATE_ADMIN, UserRole.CITY_ADMIN),
      ).toBe(true);
      expect(
        await service.canAssignRole(UserRole.STATE_ADMIN, UserRole.STATE_ADMIN),
      ).toBe(false);
      expect(
        await service.canAssignRole(
          UserRole.STATE_ADMIN,
          UserRole.COUNTRY_ADMIN,
        ),
      ).toBe(false);
      expect(
        await service.canAssignRole(UserRole.STATE_ADMIN, UserRole.ADMIN),
      ).toBe(false);
    });

    it('should return false for other roles', async () => {
      expect(
        await service.canAssignRole(UserRole.CITY_ADMIN, UserRole.CITY_ADMIN),
      ).toBe(false);
      expect(
        await service.canAssignRole(UserRole.MANAGER, UserRole.CITY_ADMIN),
      ).toBe(false);
      expect(
        await service.canAssignRole(UserRole.USER, UserRole.CITY_ADMIN),
      ).toBe(false);
    });
  });

  describe('validateAdminScope', () => {
    it('should validate CITY_ADMIN scope correctly', () => {
      const validScope = { cityIds: ['city-1', 'city-2'] };
      expect(() =>
        service['validateAdminScope'](UserRole.CITY_ADMIN, validScope),
      ).not.toThrow();

      const invalidScope = { stateIds: ['state-1'] };
      expect(() =>
        service['validateAdminScope'](UserRole.CITY_ADMIN, invalidScope),
      ).toThrow(BadRequestException);
      expect(() =>
        service['validateAdminScope'](UserRole.CITY_ADMIN, invalidScope),
      ).toThrow('City admin must have at least one city ID in scope');
    });

    it('should validate STATE_ADMIN scope correctly', () => {
      const validScope = { stateIds: ['state-1', 'state-2'] };
      expect(() =>
        service['validateAdminScope'](UserRole.STATE_ADMIN, validScope),
      ).not.toThrow();

      const invalidScope = { cityIds: ['city-1'] };
      expect(() =>
        service['validateAdminScope'](UserRole.STATE_ADMIN, invalidScope),
      ).toThrow(BadRequestException);
      expect(() =>
        service['validateAdminScope'](UserRole.STATE_ADMIN, invalidScope),
      ).toThrow('State admin must have at least one state ID in scope');
    });

    it('should validate COUNTRY_ADMIN scope correctly', () => {
      const validScope = { countryIds: ['country-1'] };
      expect(() =>
        service['validateAdminScope'](UserRole.COUNTRY_ADMIN, validScope),
      ).not.toThrow();

      const invalidScope = { cityIds: ['city-1'] };
      expect(() =>
        service['validateAdminScope'](UserRole.COUNTRY_ADMIN, invalidScope),
      ).toThrow(BadRequestException);
      expect(() =>
        service['validateAdminScope'](UserRole.COUNTRY_ADMIN, invalidScope),
      ).toThrow('Country admin must have at least one country ID in scope');
    });

    it('should throw error for invalid role', () => {
      const scope = { cityIds: ['city-1'] };
      expect(() => service['validateAdminScope'](UserRole.USER, scope)).toThrow(
        BadRequestException,
      );
      expect(() => service['validateAdminScope'](UserRole.USER, scope)).toThrow(
        'Invalid role for hierarchical admin assignment',
      );
    });
  });
});
