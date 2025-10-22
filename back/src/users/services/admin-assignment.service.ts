import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { AdminScope } from '../../common/interfaces/admin-scope.interface';
import { LocationService } from '../../office/services/location.service';

@Injectable()
export class AdminAssignmentService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private locationService: LocationService,
  ) {}

  async assignCityAdmin(
    userId: string,
    cityId: number,
    assignedBy: string,
  ): Promise<User> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get city and state information
    const city = await this.locationService.getCityById(cityId);
    if (!city) {
      throw new NotFoundException('City not found');
    }

    const state = await this.locationService.getStateById(city.stateId);
    if (!state) {
      throw new NotFoundException('State not found');
    }

    const scope: AdminScope = {
      level: 'city',
      countryId: state.countryId,
      stateId: city.stateId,
      cityId: cityId,
      assignedBy,
      assignedAt: new Date(),
    };

    await this.userRepository.update(userId, {
      role: UserRole.CITY_ADMIN,
      adminScope: JSON.stringify(scope),
      assignedBy,
      assignedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  async assignStateAdmin(
    userId: string,
    stateId: number,
    assignedBy: string,
  ): Promise<User> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get state information
    const state = await this.locationService.getStateById(stateId);
    if (!state) {
      throw new NotFoundException('State not found');
    }

    const scope: AdminScope = {
      level: 'state',
      countryId: state.countryId,
      stateId: stateId,
      assignedBy,
      assignedAt: new Date(),
    };

    await this.userRepository.update(userId, {
      role: UserRole.STATE_ADMIN,
      adminScope: JSON.stringify(scope),
      assignedBy,
      assignedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  async assignCountryAdmin(
    userId: string,
    countryId: number,
    assignedBy: string,
  ): Promise<User> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify country exists
    const country = await this.locationService.getCountryById(countryId);
    if (!country) {
      throw new NotFoundException('Country not found');
    }

    const scope: AdminScope = {
      level: 'country',
      countryId: countryId,
      assignedBy,
      assignedAt: new Date(),
    };

    await this.userRepository.update(userId, {
      role: UserRole.COUNTRY_ADMIN,
      adminScope: JSON.stringify(scope),
      assignedBy,
      assignedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  async removeAdminRole(userId: string, assignedBy: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has hierarchical admin role
    if (
      ![
        UserRole.CITY_ADMIN,
        UserRole.STATE_ADMIN,
        UserRole.COUNTRY_ADMIN,
      ].includes(user.role)
    ) {
      throw new BadRequestException('User is not a hierarchical admin');
    }

    await this.userRepository.update(userId, {
      role: UserRole.USER,
      adminScope: undefined,
      assignedBy: undefined,
      assignedAt: undefined,
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }
}
