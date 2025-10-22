import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Office, OfficeStatus } from '../entities/office.entity';
import { User } from '../../users/entities/user.entity';
import { LocationService } from './location.service';
import { OfficeTypeService } from './office-type.service';
import { CreateOfficeDto, UpdateOfficeDto } from '../dto/office.dto';

@Injectable()
export class OfficeManagementService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly locationService: LocationService,
    private readonly officeTypeService: OfficeTypeService,
  ) {}

  async createOffice(
    officeId: string,
    createOfficeDto: CreateOfficeDto,
  ): Promise<any> {
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
      createdBy: officeId,
    });

    const savedOffice = await this.officeRepository.save(office);
    return this.mapToResponseDto(savedOffice);
  }

  async getOffices(officeId: string): Promise<any[]> {
    const offices = await this.officeRepository.find({
      where: { createdBy: officeId },
      relations: ['officeType'],
    });

    return offices.map((office) => this.mapToResponseDto(office));
  }

  async getOfficeById(officeId: string, targetOfficeId: string): Promise<any> {
    const office = await this.officeRepository.findOne({
      where: { id: targetOfficeId, createdBy: officeId },
      relations: ['officeType'],
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    return this.mapToResponseDto(office);
  }

  async updateOffice(
    officeId: string,
    targetOfficeId: string,
    updateOfficeDto: UpdateOfficeDto,
  ): Promise<any> {
    const office = await this.officeRepository.findOne({
      where: { id: targetOfficeId, createdBy: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

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

    Object.assign(office, updateOfficeDto, { updatedBy: officeId });
    const updatedOffice = await this.officeRepository.save(office);
    return this.mapToResponseDto(updatedOffice);
  }

  async deleteOffice(officeId: string, targetOfficeId: string): Promise<void> {
    const office = await this.officeRepository.findOne({
      where: { id: targetOfficeId, createdBy: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    await this.officeRepository.softDelete(targetOfficeId);
  }

  async getOfficeManagementStatistics(officeId: string): Promise<any> {
    // Get total offices
    const totalOffices = await this.officeRepository.count({
      where: { createdBy: officeId },
    });

    // Get active offices
    const activeOffices = await this.officeRepository.count({
      where: { createdBy: officeId, status: OfficeStatus.ACTIVE },
    });

    // Get inactive offices
    const inactiveOffices = await this.officeRepository.count({
      where: { createdBy: officeId, status: OfficeStatus.INACTIVE },
    });

    // Get template offices
    const templateOffices = await this.officeRepository.count({
      where: { createdBy: officeId, isTemplate: true },
    });

    // Get offices with QR codes
    const officesWithQRCodes = await this.officeRepository.count({
      where: { createdBy: officeId, qrCode: Not('') },
    });

    // Calculate average offices per type
    const officeTypeStats = await this.officeRepository
      .createQueryBuilder('office')
      .select('office.officeTypeId')
      .addSelect('COUNT(*)', 'count')
      .where('office.createdBy = :officeId', { officeId })
      .groupBy('office.officeTypeId')
      .getRawMany();

    const averageOfficesPerType =
      officeTypeStats.length > 0
        ? officeTypeStats.reduce((sum, stat) => sum + parseInt(stat.count), 0) /
          officeTypeStats.length
        : 0;

    return {
      totalOffices,
      activeOffices,
      inactiveOffices,
      templateOffices,
      officesWithQRCodes,
      averageOfficesPerType: Math.round(averageOfficesPerType * 100) / 100,
    };
  }

  async generateOfficeQRCode(
    officeId: string,
    targetOfficeId: string,
  ): Promise<{ qrCode: string }> {
    const office = await this.officeRepository.findOne({
      where: { id: targetOfficeId, createdBy: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Generate QR code
    const qrCode = `office:${targetOfficeId}:${office.name}`;

    // Update office with QR code
    office.qrCode = qrCode;
    await this.officeRepository.save(office);

    return { qrCode };
  }

  private mapToResponseDto(office: Office): any {
    return {
      id: office.id,
      name: office.name,
      image: office.image,
      status: office.status,
      isTemplate: office.isTemplate,
      qrCode: office.qrCode,
      officeTypeId: office.officeTypeId,
      latitude: office.latitude,
      longitude: office.longitude,
      countryId: office.countryId,
      stateId: office.stateId,
      cityId: office.cityId,
      createdBy: office.createdBy,
      updatedBy: office.updatedBy,
      createdAt: office.createdAt,
      updatedAt: office.updatedAt,
    };
  }
}
