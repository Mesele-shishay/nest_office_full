import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface Country {
  id: number;
  name: string;
  iso2: string;
  latitude?: string;
  longitude?: string;
}

export interface State {
  id: number;
  name: string;
  iso2: string;
  countryId: number;
  countryName: string;
  cityCount?: number;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  stateName: string;
  countryName: string;
}

interface LocationApiResponse<T> {
  data: T[];
  meta: {
    query: string;
    type: string;
    timestamp: string;
    executionTime: number;
    total: number;
  };
}

@Injectable()
export class LocationService {
  private readonly baseUrl = 'https://tugza.tech/api/locations/v2';

  constructor(private readonly httpService: HttpService) {}

  async getCountries(): Promise<Country[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<LocationApiResponse<Country>>(
          `${this.baseUrl}?type=countries`,
        ),
      );
      return response.data.data;
    } catch {
      throw new BadRequestException('Failed to fetch countries');
    }
  }

  async getStates(countryId: number): Promise<State[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<LocationApiResponse<State>>(
          `${this.baseUrl}?type=states&countryId=${countryId}`,
        ),
      );
      return response.data.data;
    } catch {
      throw new BadRequestException(
        `Failed to fetch states for country ID ${countryId}`,
      );
    }
  }

  async getCities(stateId: number): Promise<City[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<LocationApiResponse<City>>(
          `${this.baseUrl}?type=cities&stateId=${stateId}`,
        ),
      );
      return response.data.data;
    } catch {
      throw new BadRequestException(
        `Failed to fetch cities for state ID ${stateId}`,
      );
    }
  }

  async validateLocation(
    countryId: number,
    stateId: number,
    cityId: number,
  ): Promise<boolean> {
    try {
      // Validate country exists
      const countries = await this.getCountries();
      const country = countries.find((c) => c.id === countryId);
      if (!country) {
        throw new BadRequestException(`Invalid country ID: ${countryId}`);
      }

      // Validate state exists and belongs to country
      const states = await this.getStates(countryId);
      const state = states.find((s) => s.id === stateId);
      if (!state) {
        throw new BadRequestException(
          `Invalid state ID: ${stateId} for country ID: ${countryId}`,
        );
      }

      // Validate city exists and belongs to state
      const cities = await this.getCities(stateId);
      const city = cities.find((c) => c.id === cityId);
      if (!city) {
        throw new BadRequestException(
          `Invalid city ID: ${cityId} for state ID: ${stateId}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate location');
    }
  }

  async getCountryById(countryId: number): Promise<Country | null> {
    try {
      const countries = await this.getCountries();
      return countries.find((c) => c.id === countryId) || null;
    } catch {
      return null;
    }
  }

  async getStateById(stateId: number): Promise<State | null> {
    try {
      // We need to search through all countries to find the state
      const countries = await this.getCountries();
      for (const country of countries) {
        const states = await this.getStates(country.id);
        const state = states.find((s) => s.id === stateId);
        if (state) {
          return state;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async getCityById(cityId: number): Promise<City | null> {
    try {
      // We need to search through all states to find the city
      const countries = await this.getCountries();
      for (const country of countries) {
        const states = await this.getStates(country.id);
        for (const state of states) {
          const cities = await this.getCities(state.id);
          const city = cities.find((c) => c.id === cityId);
          if (city) {
            return city;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
