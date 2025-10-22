import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeType } from '../entities/office-type.entity';
import {
  CreateOfficeTypeDto,
  UpdateOfficeTypeDto,
} from '../dto/office-type.dto';

@Injectable()
export class OfficeTypeService {
  constructor(
    @InjectRepository(OfficeType)
    private readonly officeTypeRepository: Repository<OfficeType>,
  ) {}

  async create(createOfficeTypeDto: CreateOfficeTypeDto): Promise<OfficeType> {
    // Check if office type with same name already exists
    const existingOfficeType = await this.officeTypeRepository.findOne({
      where: { name: createOfficeTypeDto.name },
    });

    if (existingOfficeType) {
      throw new ConflictException('Office type with this name already exists');
    }

    const officeType = this.officeTypeRepository.create(createOfficeTypeDto);
    return await this.officeTypeRepository.save(officeType);
  }

  async findAll(): Promise<OfficeType[]> {
    return await this.officeTypeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OfficeType> {
    const officeType = await this.officeTypeRepository.findOne({
      where: { id },
      relations: ['offices'],
    });

    if (!officeType) {
      throw new NotFoundException(`Office type with ID ${id} not found`);
    }

    return officeType;
  }

  async update(
    id: string,
    updateOfficeTypeDto: UpdateOfficeTypeDto,
  ): Promise<OfficeType> {
    const officeType = await this.findOne(id);

    // Check if new name conflicts with existing office types
    if (
      updateOfficeTypeDto.name &&
      updateOfficeTypeDto.name !== officeType.name
    ) {
      const existingOfficeType = await this.officeTypeRepository.findOne({
        where: { name: updateOfficeTypeDto.name },
      });

      if (existingOfficeType) {
        throw new ConflictException(
          'Office type with this name already exists',
        );
      }
    }

    Object.assign(officeType, updateOfficeTypeDto);
    return await this.officeTypeRepository.save(officeType);
  }

  async remove(id: string): Promise<void> {
    const officeType = await this.findOne(id);

    // Check if office type has associated offices
    if (officeType.offices && officeType.offices.length > 0) {
      throw new ConflictException(
        'Cannot delete office type with associated offices',
      );
    }

    await this.officeTypeRepository.remove(officeType);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.officeTypeRepository.count({ where: { id } });
    return count > 0;
  }
}
