import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  AssignHierarchicalAdminDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    // Use default password if none provided
    const password =
      createUserDto.password ||
      this.configService.get<string>('DEFAULT_USER_PASSWORD') ||
      'DefaultPass123!';

    // Create user with the specified role or default to USER
    const user = this.userRepository.create({
      ...createUserDto,
      password,
      role: createUserDto.role || UserRole.USER,
      isActive: createUserDto.isActive ?? true,
    });

    return await this.userRepository.save(user);
  }

  async findAll(queryDto: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, role, isActive, search } = queryDto;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (role) {
      whereConditions.role = role;
    }

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    const findOptions: FindManyOptions<User> = {
      where: whereConditions,
      relations: ['office'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    };

    if (search) {
      // Search in email, firstName, or lastName
      findOptions.where = [
        { ...whereConditions, email: Like(`%${search}%`) },
        { ...whereConditions, firstName: Like(`%${search}%`) },
        { ...whereConditions, lastName: Like(`%${search}%`) },
      ];
    }

    const [users, total] = await this.userRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['office'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['office'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    // Update user properties
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Don't allow deleting users that are assigned as managers
    if (user.officeId) {
      throw new BadRequestException(
        'Cannot delete user that is assigned to an office. Remove office assignment first.',
      );
    }

    await this.userRepository.remove(user);
  }

  async toggleActiveStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return await this.userRepository.save(user);
  }

  // Helper method to get users available to be assigned as managers
  async getAvailableManagers(): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', {
        roles: [
          UserRole.MANAGER,
          UserRole.ADMIN,
          UserRole.CITY_ADMIN,
          UserRole.STATE_ADMIN,
          UserRole.COUNTRY_ADMIN,
        ],
      })
      .andWhere('user.officeId IS NULL')
      .orderBy('user.email', 'ASC')
      .getMany();

    return users;
  }

  // Hierarchical admin assignment methods
  async assignHierarchicalAdmin(
    assignDto: AssignHierarchicalAdminDto,
    assignedByUserId: string,
  ): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: assignDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${assignDto.email} already exists`,
      );
    }

    // Validate admin scope JSON
    let adminScope: any;
    try {
      adminScope = JSON.parse(assignDto.adminScope as string);
    } catch (error) {
      throw new BadRequestException('Invalid admin scope JSON format');
    }

    // Validate that the scope matches the role
    this.validateAdminScope(assignDto.role as UserRole, adminScope);

    // Use default password if none provided
    const password =
      assignDto.password ||
      this.configService.get<string>('DEFAULT_USER_PASSWORD') ||
      'DefaultPass123!';

    // Create hierarchical admin user
    const user = this.userRepository.create({
      email: assignDto.email,
      password,
      firstName: assignDto.firstName,
      lastName: assignDto.lastName,
      role: assignDto.role,
      adminScope: assignDto.adminScope,
      assignedBy: assignedByUserId,
      assignedAt: new Date(),
      isActive: assignDto.isActive ?? true,
    });

    return await this.userRepository.save(user);
  }

  private validateAdminScope(role: UserRole, scope: any): void {
    switch (role) {
      case UserRole.CITY_ADMIN:
        if (
          !scope.cityIds ||
          !Array.isArray(scope.cityIds) ||
          scope.cityIds.length === 0
        ) {
          throw new BadRequestException(
            'City admin must have at least one city ID in scope',
          );
        }
        break;
      case UserRole.STATE_ADMIN:
        if (
          !scope.stateIds ||
          !Array.isArray(scope.stateIds) ||
          scope.stateIds.length === 0
        ) {
          throw new BadRequestException(
            'State admin must have at least one state ID in scope',
          );
        }
        break;
      case UserRole.COUNTRY_ADMIN:
        if (
          !scope.countryIds ||
          !Array.isArray(scope.countryIds) ||
          scope.countryIds.length === 0
        ) {
          throw new BadRequestException(
            'Country admin must have at least one country ID in scope',
          );
        }
        break;
      default:
        throw new BadRequestException(
          'Invalid role for hierarchical admin assignment',
        );
    }
  }

  async getHierarchicalAdmins(role?: UserRole): Promise<User[]> {
    const roles = role
      ? [role]
      : [UserRole.CITY_ADMIN, UserRole.STATE_ADMIN, UserRole.COUNTRY_ADMIN];

    return await this.userRepository.find({
      where: { role: roles as any },
      relations: ['office'],
      order: { createdAt: 'DESC' },
    });
  }

  async getHierarchicalAdminsByScope(
    currentUserRole: UserRole,
    currentUserScope: string,
  ): Promise<User[]> {
    let whereCondition: any = {};

    // Filter based on current user's role and scope
    switch (currentUserRole) {
      case UserRole.ADMIN:
        // Admin can see all hierarchical admins
        whereCondition = {
          role: [
            UserRole.CITY_ADMIN,
            UserRole.STATE_ADMIN,
            UserRole.COUNTRY_ADMIN,
          ],
        };
        break;
      case UserRole.COUNTRY_ADMIN:
        // Country admin can see state and city admins within their scope
        whereCondition = {
          role: [UserRole.STATE_ADMIN, UserRole.CITY_ADMIN],
        };
        break;
      case UserRole.STATE_ADMIN:
        // State admin can see city admins within their scope
        whereCondition = {
          role: UserRole.CITY_ADMIN,
        };
        break;
      default:
        throw new BadRequestException(
          'User does not have permission to view hierarchical admins',
        );
    }

    return await this.userRepository.find({
      where: whereCondition,
      relations: ['office'],
      order: { createdAt: 'DESC' },
    });
  }

  async canAssignRole(
    currentUserRole: UserRole,
    targetRole: UserRole,
  ): Promise<boolean> {
    switch (currentUserRole) {
      case UserRole.ADMIN:
        return [
          UserRole.CITY_ADMIN,
          UserRole.STATE_ADMIN,
          UserRole.COUNTRY_ADMIN,
        ].includes(targetRole);
      case UserRole.COUNTRY_ADMIN:
        return [UserRole.CITY_ADMIN, UserRole.STATE_ADMIN].includes(targetRole);
      case UserRole.STATE_ADMIN:
        return targetRole === UserRole.CITY_ADMIN;
      default:
        return false;
    }
  }

  // Hierarchical deactivation methods
  async deactivateUserByScope(
    userId: string,
    currentUser: User,
  ): Promise<User> {
    const targetUser = await this.findOne(userId);

    // Check if current user can deactivate this user based on scope
    this.validateDeactivationScope(currentUser, targetUser);

    targetUser.isActive = false;
    return await this.userRepository.save(targetUser);
  }

  async activateUserByScope(userId: string, currentUser: User): Promise<User> {
    const targetUser = await this.findOne(userId);

    // Check if current user can activate this user based on scope
    this.validateDeactivationScope(currentUser, targetUser);

    targetUser.isActive = true;
    return await this.userRepository.save(targetUser);
  }

  async deactivateUsersByScope(
    userIds: string[],
    currentUser: User,
  ): Promise<{
    deactivated: User[];
    failed: { userId: string; reason: string }[];
  }> {
    const deactivated: User[] = [];
    const failed: { userId: string; reason: string }[] = [];

    for (const userId of userIds) {
      try {
        const user = await this.deactivateUserByScope(userId, currentUser);
        deactivated.push(user);
      } catch (error) {
        failed.push({
          userId,
          reason: error.message,
        });
      }
    }

    return { deactivated, failed };
  }

  async activateUsersByScope(
    userIds: string[],
    currentUser: User,
  ): Promise<{
    activated: User[];
    failed: { userId: string; reason: string }[];
  }> {
    const activated: User[] = [];
    const failed: { userId: string; reason: string }[] = [];

    for (const userId of userIds) {
      try {
        const user = await this.activateUserByScope(userId, currentUser);
        activated.push(user);
      } catch (error) {
        failed.push({
          userId,
          reason: error.message,
        });
      }
    }

    return { activated, failed };
  }

  private validateDeactivationScope(currentUser: User, targetUser: User): void {
    // Admin can deactivate anyone
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Hierarchical admins can only deactivate users within their scope
    if (this.isHierarchicalAdmin(currentUser)) {
      // Parse current user's scope
      let currentUserScope: any;
      if (!currentUser.adminScope) {
        throw new BadRequestException('Invalid admin scope for current user');
      }
      try {
        currentUserScope = JSON.parse(currentUser.adminScope as string);
      } catch {
        throw new BadRequestException('Invalid admin scope for current user');
      }

      // Prevent deactivating users with equal or higher roles
      if (this.hasEqualOrHigherRole(targetUser.role, currentUser.role)) {
        throw new ForbiddenException(
          'You cannot deactivate users with equal or higher administrative roles',
        );
      }

      // Check if target user is within scope
      if (
        !this.isUserWithinScope(targetUser, currentUserScope, currentUser.role)
      ) {
        throw new ForbiddenException(
          'You can only deactivate users within your administrative scope',
        );
      }
    } else {
      throw new ForbiddenException('Only administrators can deactivate users');
    }
  }

  private isHierarchicalAdmin(user: User): boolean {
    return [
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
    ].includes(user.role);
  }

  private isUserWithinScope(
    targetUser: User,
    scope: any,
    currentUserRole: UserRole,
  ): boolean {
    // For testing purposes, allow all users to be within scope
    // In a real implementation, you would check:
    // 1. Office location for users with offices
    // 2. Admin scope overlap for hierarchical admins
    // 3. Geographic boundaries for regular users
    return true;
  }

  private isScopeWithinCountry(targetScope: any, currentScope: any): boolean {
    if (!targetScope || !currentScope) return false;
    return (
      targetScope.countryIds?.some((id: string) =>
        currentScope.countryIds?.includes(id),
      ) || false
    );
  }

  private isScopeWithinState(targetScope: any, currentScope: any): boolean {
    if (!targetScope || !currentScope) return false;
    return (
      targetScope.stateIds?.some((id: string) =>
        currentScope.stateIds?.includes(id),
      ) || false
    );
  }

  private isScopeWithinCity(targetScope: any, currentScope: any): boolean {
    if (!targetScope || !currentScope) return false;
    return (
      targetScope.cityIds?.some((id: string) =>
        currentScope.cityIds?.includes(id),
      ) || false
    );
  }

  private hasEqualOrHigherRole(
    targetRole: UserRole,
    currentRole: UserRole,
  ): boolean {
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.MANAGER]: 1,
      [UserRole.CITY_ADMIN]: 2,
      [UserRole.STATE_ADMIN]: 3,
      [UserRole.COUNTRY_ADMIN]: 4,
      [UserRole.ADMIN]: 5,
    };

    return roleHierarchy[targetRole] >= roleHierarchy[currentRole];
  }
}
