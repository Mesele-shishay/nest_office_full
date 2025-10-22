import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import * as QRCode from 'qrcode';
import { Office } from '../entities/office.entity';
import { OfficeStatus } from '../entities/office.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { AdminScope } from '../../common/interfaces/admin-scope.interface';
import {
  CreateOfficeDto,
  UpdateOfficeDto,
  OfficeQueryDto,
  AssignManagerDto,
  RegisterOfficeDto,
  CloneOfficeDto,
} from '../dto/office.dto';
import { LocationService } from './location.service';
import { OfficeTypeService } from './office-type.service';
import { MailService } from '../../mail/mail.service';
import {
  calculateDistancesForOffices,
  sortOfficesByDistance,
  Coordinates,
} from '../../common/utils/distance.util';

@Injectable()
export class OfficeService {
  private readonly logger = new Logger(OfficeService.name);

  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly locationService: LocationService,
    private readonly officeTypeService: OfficeTypeService,
    private readonly mailService: MailService,
  ) {}

  async create(
    createOfficeDto: CreateOfficeDto,
    createdBy: string,
  ): Promise<Office> {
    // Validate office type exists
    const officeTypeExists = await this.officeTypeService.exists(
      createOfficeDto.officeTypeId,
    );
    if (!officeTypeExists) {
      throw new NotFoundException(
        `Office type with ID ${createOfficeDto.officeTypeId} not found`,
      );
    }

    // Validate location
    await this.locationService.validateLocation(
      createOfficeDto.countryId,
      createOfficeDto.stateId,
      createOfficeDto.cityId,
    );

    // Create office
    const office = this.officeRepository.create({
      ...createOfficeDto,
      createdBy,
    });

    // Generate QR code
    const qrCodeData = await this.generateQRCode(office);
    office.qrCode = qrCodeData;

    // Save the office first
    const savedOffice = await this.officeRepository.save(office);

    // Note: Default feature assignment is now handled by the new feature group system
    // The old individual feature assignment has been replaced with feature groups

    return savedOffice;
  }

  async register(registerOfficeDto: RegisterOfficeDto): Promise<Office> {
    // If templateOfficeId is provided, clone from template
    if (registerOfficeDto.templateOfficeId) {
      return this.cloneFromTemplate(
        registerOfficeDto.templateOfficeId,
        registerOfficeDto,
      );
    }

    // Validate office type exists
    const officeTypeExists = await this.officeTypeService.exists(
      registerOfficeDto.officeTypeId,
    );
    if (!officeTypeExists) {
      throw new NotFoundException(
        `Office type with ID ${registerOfficeDto.officeTypeId} not found`,
      );
    }

    // Validate location
    await this.locationService.validateLocation(
      registerOfficeDto.countryId,
      registerOfficeDto.stateId,
      registerOfficeDto.cityId,
    );

    // Create office with INACTIVE status by default
    const office = this.officeRepository.create({
      name: registerOfficeDto.name,
      image: registerOfficeDto.image,
      status: OfficeStatus.INACTIVE,
      officeTypeId: registerOfficeDto.officeTypeId,
      latitude: registerOfficeDto.latitude,
      longitude: registerOfficeDto.longitude,
      countryId: registerOfficeDto.countryId,
      stateId: registerOfficeDto.stateId,
      cityId: registerOfficeDto.cityId,
      contactEmail: registerOfficeDto.contactEmail,
      contactPhone: registerOfficeDto.contactPhone,
      requestedBy: null, // Public registration, no user ID
      approvedBy: null,
      approvedAt: null,
      createdBy: 'system', // Temporary value, will be updated when approved
    });

    // Generate QR code
    const qrCodeData = await this.generateQRCode(office);
    office.qrCode = qrCodeData;

    // Save the office
    const savedOffice = await this.officeRepository.save(office);

    return savedOffice;
  }

  async findTemplateOffices(): Promise<Office[]> {
    return await this.officeRepository.find({
      where: { isTemplate: true },
      relations: ['officeType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    queryDto: OfficeQueryDto,
    user?: User,
  ): Promise<{
    offices: (Office & { distance?: number })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      officeTypeId,
      search,
      isTemplate,
      latitude,
      longitude,
    } = queryDto;

    // Validate that both latitude and longitude are provided together, or neither
    if (
      (latitude !== undefined && longitude === undefined) ||
      (latitude === undefined && longitude !== undefined)
    ) {
      throw new BadRequestException(
        'Both latitude and longitude must be provided together, or neither should be provided',
      );
    }

    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (officeTypeId) {
      whereConditions.officeTypeId = officeTypeId;
    }

    if (isTemplate !== undefined) {
      whereConditions.isTemplate = isTemplate;
    } else {
      // By default, exclude templates from regular office listings
      whereConditions.isTemplate = false;
    }

    // Apply scope filtering for hierarchical admins
    if (user && this.isHierarchicalAdmin(user)) {
      const scopeConditions = this.getScopeConditions(user);
      if (scopeConditions) {
        Object.assign(whereConditions, scopeConditions);
      }
    }

    const findOptions: FindManyOptions<Office> = {
      where: whereConditions,
      relations: ['officeType', 'managers'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    };

    if (search) {
      findOptions.where = {
        ...whereConditions,
        name: Like(`%${search}%`),
      };
    }

    // If distance calculation is requested, we need to fetch all offices first
    // then calculate distances and apply pagination
    if (latitude !== undefined && longitude !== undefined) {
      // Remove pagination from the query to get all offices for distance calculation
      const allOfficesFindOptions: FindManyOptions<Office> = {
        ...findOptions,
        skip: undefined,
        take: undefined,
      };

      const [allOffices, total] = await this.officeRepository.findAndCount(
        allOfficesFindOptions,
      );

      // Filter offices that have coordinates
      const officesWithCoordinates = allOffices.filter(
        (office) => office.latitude !== null && office.longitude !== null,
      );

      // Calculate distances
      const referencePoint: Coordinates = { latitude, longitude };
      const officesWithDistances = calculateDistancesForOffices(
        officesWithCoordinates,
        referencePoint,
      );

      // Sort by distance (closest first)
      const sortedOffices = sortOfficesByDistance(officesWithDistances, true);

      // Apply pagination to sorted results
      const paginatedOffices = sortedOffices.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      return {
        offices: paginatedOffices,
        total,
        page,
        limit,
        totalPages,
      };
    }

    // Regular query without distance calculation
    const [offices, total] =
      await this.officeRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      offices,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Office> {
    const office = await this.officeRepository.findOne({
      where: { id },
      relations: ['officeType', 'managers'],
    });

    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    return office;
  }

  async findByQRCode(qrCode: string): Promise<Office> {
    const foundOffice = await this.officeRepository.findOne({
      where: { qrCode },
      relations: ['officeType', 'managers'],
    });

    if (!foundOffice) {
      throw new NotFoundException('Office not found for this QR code');
    }

    return foundOffice;
  }

  async update(
    id: string,
    updateOfficeDto: UpdateOfficeDto,
    updatedBy: string,
  ): Promise<Office> {
    const office = await this.findOne(id);

    // Validate office type if provided
    if (updateOfficeDto.officeTypeId) {
      const officeTypeExists = await this.officeTypeService.exists(
        updateOfficeDto.officeTypeId,
      );
      if (!officeTypeExists) {
        throw new NotFoundException(
          `Office type with ID ${updateOfficeDto.officeTypeId} not found`,
        );
      }
    }

    // Validate location if provided
    if (
      updateOfficeDto.countryId ||
      updateOfficeDto.stateId ||
      updateOfficeDto.cityId
    ) {
      const countryId = updateOfficeDto.countryId || office.countryId;
      const stateId = updateOfficeDto.stateId || office.stateId;
      const cityId = updateOfficeDto.cityId || office.cityId;

      await this.locationService.validateLocation(countryId, stateId, cityId);
    }

    Object.assign(office, updateOfficeDto, { updatedBy });
    return await this.officeRepository.save(office);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.officeRepository.softDelete(id);
  }

  async assignManager(
    officeId: string,
    assignManagerDto: AssignManagerDto,
  ): Promise<Office> {
    const office = await this.findOne(officeId);

    // Prevent assigning managers to template offices
    if (office.isTemplate) {
      throw new BadRequestException(
        'Cannot assign managers to template offices. Templates are used for cloning and should not have managers.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: assignManagerDto.managerId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${assignManagerDto.managerId} not found`,
      );
    }

    // Check if user is already assigned to another office
    if (user.officeId && user.officeId !== officeId) {
      throw new ConflictException('User is already assigned to another office');
    }

    // Check if user is already assigned to this office
    if (user.officeId === officeId) {
      throw new ConflictException('User is already assigned to this office');
    }

    // Assign user to office and update role to MANAGER if not already ADMIN
    user.officeId = officeId;
    if (user.role !== UserRole.ADMIN) {
      user.role = UserRole.MANAGER;
    }

    await this.userRepository.save(user);

    // Reload office with updated managers
    return await this.findOne(officeId);
  }

  async removeManager(officeId: string, managerId: string): Promise<Office> {
    await this.findOne(officeId);
    const user = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${managerId} not found`);
    }

    if (user.officeId !== officeId) {
      throw new ConflictException('User is not assigned to this office');
    }

    // Remove user from office and revert role to USER if not ADMIN
    user.officeId = null;
    if (user.role === UserRole.MANAGER) {
      user.role = UserRole.USER;
    }

    await this.userRepository.save(user);

    // Reload office with updated managers
    return await this.findOne(officeId);
  }

  async approveOffice(
    officeId: string,
    approvedBy: string,
  ): Promise<{
    office: Office;
    manager: User;
  }> {
    const office = await this.findOne(officeId);

    // Check if office is already active
    if (office.status === OfficeStatus.ACTIVE) {
      throw new BadRequestException('Office is already active');
    }

    // Check if contact email is provided
    if (!office.contactEmail) {
      throw new BadRequestException(
        'Office contact email is required for approval',
      );
    }

    // Check if manager already exists for this office
    const existingManager = await this.userRepository.findOne({
      where: { officeId: officeId },
    });

    if (existingManager) {
      throw new BadRequestException('Manager already exists for this office');
    }

    // Generate a temporary password
    const tempPassword = this.generateTemporaryPassword();

    // Create manager user
    const manager = this.userRepository.create({
      email: office.contactEmail,
      password: tempPassword,
      firstName: 'Office',
      lastName: 'Manager',
      phone: office.contactPhone,
      role: UserRole.MANAGER,
      officeId: officeId,
      isActive: true,
    });

    const savedManager = await this.userRepository.save(manager);

    // Update office status and approval metadata
    office.status = OfficeStatus.ACTIVE;
    office.approvedBy = approvedBy;
    office.approvedAt = new Date();
    office.createdBy = approvedBy; // Set the admin as creator

    const updatedOffice = await this.officeRepository.save(office);

    // Send email with manager credentials
    try {
      await this.mailService.sendManagerCredentials(
        savedManager.email,
        tempPassword,
        office.name,
        savedManager.firstName,
      );
    } catch (error: unknown) {
      // Log error but don't fail the approval process
      this.logger.error(
        'Failed to send manager credentials email:',
        String(error),
      );
    }

    return {
      office: updatedOffice,
      manager: savedManager,
    };
  }

  private generateTemporaryPassword(): string {
    // Generate a secure temporary password
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async cloneTemplate(
    templateId: string,
    cloneOfficeDto: CloneOfficeDto,
    createdBy: string,
  ): Promise<Office> {
    // Find the template office
    const templateOffice = await this.officeRepository.findOne({
      where: { id: templateId, isTemplate: true },
      relations: ['officeType', 'featureGroups'],
    });

    if (!templateOffice) {
      throw new NotFoundException(
        `Template office with ID ${templateId} not found`,
      );
    }

    // Validate location
    await this.locationService.validateLocation(
      cloneOfficeDto.countryId,
      cloneOfficeDto.stateId,
      cloneOfficeDto.cityId,
    );

    // Create new office based on template
    const newOffice = this.officeRepository.create({
      name: cloneOfficeDto.name,
      image: cloneOfficeDto.image || templateOffice.image,
      status: OfficeStatus.ACTIVE, // Admin-created offices are active by default
      isTemplate: false, // Cloned offices are not templates
      officeTypeId: templateOffice.officeTypeId,
      latitude: cloneOfficeDto.latitude || templateOffice.latitude,
      longitude: cloneOfficeDto.longitude || templateOffice.longitude,
      countryId: cloneOfficeDto.countryId,
      stateId: cloneOfficeDto.stateId,
      cityId: cloneOfficeDto.cityId,
      createdBy,
    });

    // Generate QR code
    const qrCodeData = await this.generateQRCode(newOffice);
    newOffice.qrCode = qrCodeData;

    // Save the office
    const savedOffice = await this.officeRepository.save(newOffice);

    // TODO: Clone feature groups from template if needed
    // This would require implementing feature group cloning logic

    return savedOffice;
  }

  private async cloneFromTemplate(
    templateId: string,
    registerOfficeDto: RegisterOfficeDto,
  ): Promise<Office> {
    // Find the template office
    const templateOffice = await this.officeRepository.findOne({
      where: { id: templateId, isTemplate: true },
      relations: ['officeType'],
    });

    if (!templateOffice) {
      throw new NotFoundException(
        `Template office with ID ${templateId} not found`,
      );
    }

    // Validate location
    await this.locationService.validateLocation(
      registerOfficeDto.countryId,
      registerOfficeDto.stateId,
      registerOfficeDto.cityId,
    );

    // Create new office based on template with registration data
    const newOffice = this.officeRepository.create({
      name: registerOfficeDto.name,
      image: registerOfficeDto.image || templateOffice.image,
      status: OfficeStatus.INACTIVE, // Registration offices are inactive by default
      isTemplate: false, // Cloned offices are not templates
      officeTypeId: templateOffice.officeTypeId,
      latitude: registerOfficeDto.latitude || templateOffice.latitude,
      longitude: registerOfficeDto.longitude || templateOffice.longitude,
      countryId: registerOfficeDto.countryId,
      stateId: registerOfficeDto.stateId,
      cityId: registerOfficeDto.cityId,
      contactEmail: registerOfficeDto.contactEmail,
      contactPhone: registerOfficeDto.contactPhone,
      requestedBy: null, // Public registration, no user ID
      approvedBy: null,
      approvedAt: null,
      createdBy: 'system', // Temporary value, will be updated when approved
    });

    // Generate QR code
    const qrCodeData = await this.generateQRCode(newOffice);
    newOffice.qrCode = qrCodeData;

    // Save the office
    const savedOffice = await this.officeRepository.save(newOffice);

    return savedOffice;
  }

  private async generateQRCode(office: Office): Promise<string> {
    const qrData = {
      officeId: office.id,
      name: office.name,
      type: 'office',
      timestamp: new Date().toISOString(),
    };

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  private isHierarchicalAdmin(user: User): boolean {
    return [
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
    ].includes(user.role);
  }

  private getScopeConditions(user: User): any {
    try {
      if (!user.adminScope) {
        return null;
      }
      const scope: AdminScope = JSON.parse(user.adminScope);

      switch (scope.level) {
        case 'country':
          return { countryId: scope.countryId };
        case 'state':
          return {
            countryId: scope.countryId,
            stateId: scope.stateId,
          };
        case 'city':
          return {
            countryId: scope.countryId,
            stateId: scope.stateId,
            cityId: scope.cityId,
          };
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}
