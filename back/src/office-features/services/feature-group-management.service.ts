import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In } from 'typeorm';
import { FeatureGroup } from '../entities/feature-group.entity';
import { Feature } from '../entities/feature.entity';
import { FeatureToken } from '../entities/feature-token.entity';
import {
  CreateFeatureGroupDto,
  UpdateFeatureGroupDto,
  FeatureGroupQueryDto,
} from '../dto/feature-group.dto';

@Injectable()
export class FeatureGroupService {
  constructor(
    @InjectRepository(FeatureGroup)
    private readonly featureGroupRepository: Repository<FeatureGroup>,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(FeatureToken)
    private readonly featureTokenRepository: Repository<FeatureToken>,
  ) {}

  async create(
    createFeatureGroupDto: CreateFeatureGroupDto,
  ): Promise<FeatureGroup> {
    // Check if feature group with same name already exists
    const existingByName = await this.featureGroupRepository.findOne({
      where: { name: createFeatureGroupDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        'Feature group with this name already exists',
      );
    }

    // Check if feature group with same appName already exists
    const existingByAppName = await this.featureGroupRepository.findOne({
      where: { appName: createFeatureGroupDto.appName },
    });

    if (existingByAppName) {
      throw new ConflictException(
        'Feature group with this app name already exists',
      );
    }

    // Validate that all features exist
    const features = await this.featureRepository.find({
      where: { id: In(createFeatureGroupDto.featureIds) },
    });

    if (features.length !== createFeatureGroupDto.featureIds.length) {
      throw new BadRequestException('One or more features not found');
    }

    const featureGroup = this.featureGroupRepository.create({
      name: createFeatureGroupDto.name,
      appName: createFeatureGroupDto.appName,
      description: createFeatureGroupDto.description,
      isPaid: createFeatureGroupDto.isPaid,
      features,
    });

    return await this.featureGroupRepository.save(featureGroup);
  }

  async findAll(
    queryDto: FeatureGroupQueryDto,
  ): Promise<{ featureGroups: FeatureGroup[]; total: number }> {
    const { search, isPaid, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (isPaid !== undefined) {
      where.isPaid = isPaid;
    }

    const [featureGroups, total] =
      await this.featureGroupRepository.findAndCount({
        where,
        relations: ['features', 'tokens'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    return { featureGroups, total };
  }

  async findOne(id: string): Promise<FeatureGroup> {
    const featureGroup = await this.featureGroupRepository.findOne({
      where: { id },
      relations: ['features', 'tokens'],
    });

    if (!featureGroup) {
      throw new NotFoundException('Feature group not found');
    }

    return featureGroup;
  }

  async update(
    id: string,
    updateFeatureGroupDto: UpdateFeatureGroupDto,
  ): Promise<FeatureGroup> {
    const featureGroup = await this.findOne(id);

    // Check if new name conflicts with existing feature group
    if (
      updateFeatureGroupDto.name &&
      updateFeatureGroupDto.name !== featureGroup.name
    ) {
      const existingByName = await this.featureGroupRepository.findOne({
        where: { name: updateFeatureGroupDto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          'Feature group with this name already exists',
        );
      }
    }

    // Check if new appName conflicts with existing feature group
    if (
      updateFeatureGroupDto.appName &&
      updateFeatureGroupDto.appName !== featureGroup.appName
    ) {
      const existingByAppName = await this.featureGroupRepository.findOne({
        where: { appName: updateFeatureGroupDto.appName },
      });

      if (existingByAppName) {
        throw new ConflictException(
          'Feature group with this app name already exists',
        );
      }
    }

    // Update features if provided
    if (updateFeatureGroupDto.featureIds) {
      const features = await this.featureRepository.find({
        where: { id: In(updateFeatureGroupDto.featureIds) },
      });

      if (features.length !== updateFeatureGroupDto.featureIds.length) {
        throw new BadRequestException('One or more features not found');
      }

      featureGroup.features = features;
    }

    Object.assign(featureGroup, updateFeatureGroupDto);
    return await this.featureGroupRepository.save(featureGroup);
  }

  async remove(id: string): Promise<void> {
    const featureGroup = await this.findOne(id);
    await this.featureGroupRepository.softDelete(id);
  }
}
