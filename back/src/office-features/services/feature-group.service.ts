import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { FeatureGroup } from '../entities/feature-group.entity';
import { FeatureToken } from '../entities/feature-token.entity';
import { OfficeFeatureGroup } from '../entities/office-feature-group.entity';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureQueryDto,
  CreateFeatureGroupDto,
  UpdateFeatureGroupDto,
  FeatureGroupQueryDto,
  CreateFeatureTokenDto,
  UpdateFeatureTokenDto,
} from '../dto/feature-group.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {}

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    // Check if feature with same name already exists
    const existingByName = await this.featureRepository.findOne({
      where: { name: createFeatureDto.name },
    });

    if (existingByName) {
      throw new ConflictException('Feature with this name already exists');
    }

    const feature = this.featureRepository.create(createFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async findAll(
    queryDto: FeatureQueryDto,
  ): Promise<{ features: Feature[]; total: number }> {
    const { search, isActive, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [features, total] = await this.featureRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { features, total };
  }

  async findOne(id: string): Promise<Feature> {
    const feature = await this.featureRepository.findOne({
      where: { id },
      relations: ['featureGroups'],
    });

    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    return feature;
  }

  async update(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<Feature> {
    const feature = await this.findOne(id);

    // Check if new name conflicts with existing feature
    if (updateFeatureDto.name && updateFeatureDto.name !== feature.name) {
      const existingByName = await this.featureRepository.findOne({
        where: { name: updateFeatureDto.name },
      });

      if (existingByName) {
        throw new ConflictException('Feature with this name already exists');
      }
    }

    Object.assign(feature, updateFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id);
    await this.featureRepository.softDelete(id);
  }
}
