import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSettings } from './entities/global-settings.entity';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';

@Injectable()
export class GlobalSettingsService {
  constructor(
    @InjectRepository(GlobalSettings)
    private readonly settingsRepo: Repository<GlobalSettings>,
  ) {}

  async create(dto: CreateGlobalSettingDto): Promise<GlobalSettings> {
    const exists = await this.settingsRepo.findOne({ where: { key: dto.key } });
    if (exists) {
      throw new BadRequestException('Setting with this key already exists');
    }
    const setting = this.settingsRepo.create({ ...dto });
    return this.settingsRepo.save(setting);
  }

  async findAll(): Promise<GlobalSettings[]> {
    return this.settingsRepo.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  async findByKey(key: string): Promise<GlobalSettings> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

  async getParsedByKey<T = unknown>(key: string): Promise<T | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) return null;
    return setting.getParsedValue() as T;
  }

  async update(
    key: string,
    dto: UpdateGlobalSettingDto,
  ): Promise<GlobalSettings> {
    const setting = await this.findByKey(key);
    if (dto.value !== undefined) {
      setting.setValue(dto.value);
      delete (dto as any).value;
    }
    Object.assign(setting, dto);
    return this.settingsRepo.save(setting);
  }

  async upsert(
    key: string,
    dto: UpdateGlobalSettingDto | CreateGlobalSettingDto,
  ): Promise<GlobalSettings> {
    const existing = await this.settingsRepo.findOne({ where: { key } });
    if (!existing) {
      const payload: Partial<GlobalSettings> = {
        key,
        ...(dto as Partial<GlobalSettings>),
      };
      const created = this.settingsRepo.create(payload);
      return this.settingsRepo.save(created);
    }
    return this.update(key, dto as UpdateGlobalSettingDto);
  }
}
