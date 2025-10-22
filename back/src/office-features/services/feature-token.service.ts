import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureToken } from '../entities/feature-token.entity';
import { FeatureGroup } from '../entities/feature-group.entity';
import {
  CreateFeatureTokenDto,
  UpdateFeatureTokenDto,
} from '../dto/feature-group.dto';

@Injectable()
export class FeatureTokenService {
  constructor(
    @InjectRepository(FeatureToken)
    private readonly featureTokenRepository: Repository<FeatureToken>,
    @InjectRepository(FeatureGroup)
    private readonly featureGroupRepository: Repository<FeatureGroup>,
  ) {}

  async create(
    featureGroupId: string,
    createFeatureTokenDto: CreateFeatureTokenDto,
  ): Promise<FeatureToken> {
    // Check if feature group exists
    const featureGroup = await this.featureGroupRepository.findOne({
      where: { id: featureGroupId },
    });

    if (!featureGroup) {
      throw new NotFoundException('Feature group not found');
    }

    // Check if token configuration with same name already exists
    const existingToken = await this.featureTokenRepository.findOne({
      where: { tokenName: createFeatureTokenDto.tokenName },
    });

    if (existingToken) {
      throw new ConflictException(
        'Token configuration with this name already exists',
      );
    }

    const token = this.featureTokenRepository.create({
      tokenName: createFeatureTokenDto.tokenName,
      featureGroupId,
      expiresInDays: createFeatureTokenDto.expiresInDays,
      description: createFeatureTokenDto.description,
      isActive: true,
    });

    return await this.featureTokenRepository.save(token);
  }

  async findAll(featureGroupId: string): Promise<FeatureToken[]> {
    // Check if feature group exists
    const featureGroup = await this.featureGroupRepository.findOne({
      where: { id: featureGroupId },
    });

    if (!featureGroup) {
      throw new NotFoundException('Feature group not found');
    }

    return await this.featureTokenRepository.find({
      where: { featureGroupId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FeatureToken> {
    const token = await this.featureTokenRepository.findOne({
      where: { id },
      relations: ['featureGroup'],
    });

    if (!token) {
      throw new NotFoundException('Feature token not found');
    }

    return token;
  }

  async findByTokenName(tokenName: string): Promise<FeatureToken> {
    const token = await this.featureTokenRepository.findOne({
      where: { tokenName },
      relations: ['featureGroup'],
    });

    if (!token) {
      throw new NotFoundException('Feature token not found');
    }

    return token;
  }

  async update(
    id: string,
    updateFeatureTokenDto: UpdateFeatureTokenDto,
  ): Promise<FeatureToken> {
    const token = await this.findOne(id);

    // Check if new token name conflicts with existing token configuration
    if (
      updateFeatureTokenDto.tokenName &&
      updateFeatureTokenDto.tokenName !== token.tokenName
    ) {
      const existingToken = await this.featureTokenRepository.findOne({
        where: { tokenName: updateFeatureTokenDto.tokenName },
      });

      if (existingToken) {
        throw new ConflictException(
          'Token configuration with this name already exists',
        );
      }
    }

    Object.assign(token, updateFeatureTokenDto);
    return await this.featureTokenRepository.save(token);
  }

  async remove(id: string): Promise<void> {
    const token = await this.findOne(id);
    await this.featureTokenRepository.softDelete(id);
  }
}
