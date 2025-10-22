import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, Roles } from './roles.decorator';
import { UserRole } from './role.enum';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ROLES_KEY', () => {
    it('should have correct value', () => {
      expect(ROLES_KEY).toBe('roles');
    });
  });

  describe('Roles', () => {
    it('should call SetMetadata with correct parameters for single role', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles(UserRole.ADMIN);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLES_KEY, [UserRole.ADMIN]);
    });

    it('should call SetMetadata with correct parameters for multiple roles', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles(UserRole.ADMIN, UserRole.USER);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
        UserRole.ADMIN,
        UserRole.USER,
      ]);
    });

    it('should call SetMetadata with correct parameters for empty roles', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles();

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLES_KEY, []);
    });

    it('should call SetMetadata with correct parameters for USER role only', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles(UserRole.USER);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLES_KEY, [UserRole.USER]);
    });

    it('should return the result of SetMetadata', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      const mockReturnValue = () => {};
      mockSetMetadata.mockReturnValue(mockReturnValue);

      const result = Roles(UserRole.ADMIN);

      expect(result).toBe(mockReturnValue);
    });

    it('should handle duplicate roles', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.USER);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
        UserRole.ADMIN,
        UserRole.ADMIN,
        UserRole.USER,
      ]);
    });

    it('should be callable multiple times', () => {
      const mockSetMetadata = SetMetadata as jest.MockedFunction<
        typeof SetMetadata
      >;
      mockSetMetadata.mockReturnValue(() => {});

      Roles(UserRole.ADMIN);
      Roles(UserRole.USER);

      expect(mockSetMetadata).toHaveBeenCalledTimes(2);
      expect(mockSetMetadata).toHaveBeenNthCalledWith(1, ROLES_KEY, [
        UserRole.ADMIN,
      ]);
      expect(mockSetMetadata).toHaveBeenNthCalledWith(2, ROLES_KEY, [
        UserRole.USER,
      ]);
    });
  });
});
