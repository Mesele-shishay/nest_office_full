import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  AssignHierarchicalAdminDto,
  HierarchicalAdminResponseDto,
} from './user.dto';
import { UserRole } from '../entities/user.entity';

describe('Hierarchical Admin DTOs', () => {
  describe('AssignHierarchicalAdminDto', () => {
    it('should validate successfully with valid data', async () => {
      const validDto = {
        email: 'admin@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CITY_ADMIN,
        adminScope: '{"cityIds": ["city-1", "city-2"]}',
        isActive: true,
      };

      const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with minimal required data', async () => {
      const minimalDto = {
        email: 'admin@example.com',
        role: UserRole.STATE_ADMIN,
        adminScope: '{"stateIds": ["state-1"]}',
      };

      const dto = plainToClass(AssignHierarchicalAdminDto, minimalDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('email validation', () => {
      it('should fail validation with invalid email', async () => {
        const invalidDto = {
          email: 'invalid-email',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints?.isEmail).toBeDefined();
      });

      it('should fail validation with missing email', async () => {
        const invalidDto = {
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints?.isEmail).toBeDefined();
      });
    });

    describe('password validation', () => {
      it('should fail validation with password too short', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          password: '123',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('password');
        expect(errors[0].constraints?.minLength).toBeDefined();
      });

      it('should pass validation without password (optional)', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('role validation', () => {
      it('should fail validation with invalid role', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          role: 'INVALID_ROLE',
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('role');
        expect(errors[0].constraints?.isEnum).toBeDefined();
      });

      it('should fail validation with non-hierarchical admin role', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          role: UserRole.USER,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('role');
        expect(errors[0].constraints?.isEnum).toBeDefined();
      });

      it('should pass validation with CITY_ADMIN role', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass validation with STATE_ADMIN role', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.STATE_ADMIN,
          adminScope: '{"stateIds": ["state-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass validation with COUNTRY_ADMIN role', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.COUNTRY_ADMIN,
          adminScope: '{"countryIds": ["country-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('adminScope validation', () => {
      it('should fail validation with missing adminScope', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('adminScope');
        expect(errors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with non-string adminScope', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: 123,
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('adminScope');
        expect(errors[0].constraints?.isString).toBeDefined();
      });

      it('should pass validation with valid JSON adminScope', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1", "city-2"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('isActive validation', () => {
      it('should pass validation with boolean true', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
          isActive: true,
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass validation with boolean false', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
          isActive: false,
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with non-boolean isActive', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
          isActive: 'true',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('isActive');
        expect(errors[0].constraints?.isBoolean).toBeDefined();
      });

      it('should pass validation without isActive (optional)', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('firstName and lastName validation', () => {
      it('should pass validation with valid names', async () => {
        const validDto = {
          email: 'admin@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass validation without names (optional)', async () => {
        const validDto = {
          email: 'admin@example.com',
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, validDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with non-string firstName', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          firstName: 123,
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('firstName');
        expect(errors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with non-string lastName', async () => {
        const invalidDto = {
          email: 'admin@example.com',
          lastName: 123,
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["city-1"]}',
        };

        const dto = plainToClass(AssignHierarchicalAdminDto, invalidDto);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('lastName');
        expect(errors[0].constraints?.isString).toBeDefined();
      });
    });
  });

  describe('HierarchicalAdminResponseDto', () => {
    it('should create response DTO with all fields', () => {
      const responseData = {
        id: 'admin-id',
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CITY_ADMIN,
        isActive: true,
        officeId: null,
        adminScope: '{"cityIds": ["city-1"]}',
        assignedBy: 'assigner-id',
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto = plainToClass(HierarchicalAdminResponseDto, responseData);

      expect(dto.id).toBe(responseData.id);
      expect(dto.email).toBe(responseData.email);
      expect(dto.firstName).toBe(responseData.firstName);
      expect(dto.lastName).toBe(responseData.lastName);
      expect(dto.role).toBe(responseData.role);
      expect(dto.isActive).toBe(responseData.isActive);
      expect(dto.officeId).toBe(responseData.officeId);
      expect(dto.adminScope).toBe(responseData.adminScope);
      expect(dto.assignedBy).toBe(responseData.assignedBy);
      expect(dto.assignedAt).toEqual(responseData.assignedAt);
      expect(dto.createdAt).toEqual(responseData.createdAt);
      expect(dto.updatedAt).toEqual(responseData.updatedAt);
    });

    it('should handle optional fields', () => {
      const responseData = {
        id: 'admin-id',
        email: 'admin@example.com',
        role: UserRole.CITY_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto = plainToClass(HierarchicalAdminResponseDto, responseData);

      expect(dto.id).toBe(responseData.id);
      expect(dto.email).toBe(responseData.email);
      expect(dto.role).toBe(responseData.role);
      expect(dto.isActive).toBe(responseData.isActive);
      expect(dto.firstName).toBeUndefined();
      expect(dto.lastName).toBeUndefined();
      expect(dto.officeId).toBeUndefined();
      expect(dto.adminScope).toBeUndefined();
      expect(dto.assignedBy).toBeUndefined();
      expect(dto.assignedAt).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete hierarchical admin assignment flow', async () => {
      // Test CITY_ADMIN assignment
      const cityAdminDto = {
        email: 'city@example.com',
        password: 'SecurePass123!',
        firstName: 'City',
        lastName: 'Admin',
        role: UserRole.CITY_ADMIN,
        adminScope: '{"cityIds": ["city-1", "city-2"]}',
        isActive: true,
      };

      const cityAdmin = plainToClass(AssignHierarchicalAdminDto, cityAdminDto);
      const cityErrors = await validate(cityAdmin);
      expect(cityErrors).toHaveLength(0);

      // Test STATE_ADMIN assignment
      const stateAdminDto = {
        email: 'state@example.com',
        password: 'SecurePass123!',
        firstName: 'State',
        lastName: 'Admin',
        role: UserRole.STATE_ADMIN,
        adminScope: '{"stateIds": ["state-1"]}',
        isActive: true,
      };

      const stateAdmin = plainToClass(
        AssignHierarchicalAdminDto,
        stateAdminDto,
      );
      const stateErrors = await validate(stateAdmin);
      expect(stateErrors).toHaveLength(0);

      // Test COUNTRY_ADMIN assignment
      const countryAdminDto = {
        email: 'country@example.com',
        password: 'SecurePass123!',
        firstName: 'Country',
        lastName: 'Admin',
        role: UserRole.COUNTRY_ADMIN,
        adminScope: '{"countryIds": ["country-1"]}',
        isActive: true,
      };

      const countryAdmin = plainToClass(
        AssignHierarchicalAdminDto,
        countryAdminDto,
      );
      const countryErrors = await validate(countryAdmin);
      expect(countryErrors).toHaveLength(0);
    });

    it('should fail validation for invalid role combinations', async () => {
      const invalidRoleDto = {
        email: 'admin@example.com',
        role: UserRole.USER, // Invalid for hierarchical admin
        adminScope: '{"cityIds": ["city-1"]}',
      };

      const dto = plainToClass(AssignHierarchicalAdminDto, invalidRoleDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
    });
  });
});
