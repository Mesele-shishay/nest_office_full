import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'test-uuid';
    user.email = 'test@example.com';
    user.password = 'plainPassword';
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.role = UserRole.USER;
    user.isActive = true;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password before insert', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
      expect(user.password).toBe(hashedPassword);
    });

    it('should hash password before update', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
      expect(user.password).toBe(hashedPassword);
    });

    it('should not hash password if it is empty', async () => {
      user.password = '';

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash password if it is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.password = null as any;

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash password if it is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.password = undefined as any;

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.validatePassword('plainPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        user.password,
      );
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.validatePassword('wrongPassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        user.password,
      );
    });

    it('should handle bcrypt comparison errors', async () => {
      const error = new Error('bcrypt error');
      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(user.validatePassword('plainPassword')).rejects.toThrow(
        error,
      );
    });
  });

  describe('fullName getter', () => {
    it('should return full name when both first and last names exist', () => {
      user.firstName = 'John';
      user.lastName = 'Doe';

      expect(user.fullName).toBe('John Doe');
    });

    it('should return only first name when last name is missing', () => {
      user.firstName = 'John';
      user.lastName = null;

      expect(user.fullName).toBe('John');
    });

    it('should return only last name when first name is missing', () => {
      user.firstName = null;
      user.lastName = 'Doe';

      expect(user.fullName).toBe('Doe');
    });

    it('should return empty string when both names are missing', () => {
      user.firstName = null;
      user.lastName = null;

      expect(user.fullName).toBe('');
    });

    it('should trim whitespace from full name', () => {
      user.firstName = '  John  ';
      user.lastName = '  Doe  ';

      expect(user.fullName).toBe('John     Doe');
    });

    it('should handle empty string names', () => {
      user.firstName = '';
      user.lastName = '';

      expect(user.fullName).toBe('');
    });
  });

  describe('UserRole enum', () => {
    it('should have correct role values', () => {
      expect(UserRole.USER).toBe('USER');
      expect(UserRole.ADMIN).toBe('ADMIN');
    });
  });

  describe('entity properties', () => {
    it('should have all required properties', () => {
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.isActive).toBeDefined();
      expect(user.resetToken).toBeDefined();
      expect(user.resetTokenExpiry).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should have correct default values', () => {
      const newUser = new User();
      expect(newUser.role).toBeUndefined(); // Default values are set by TypeORM, not in constructor
      expect(newUser.isActive).toBeUndefined();
      expect(newUser.resetToken).toBeUndefined();
      expect(newUser.resetTokenExpiry).toBeUndefined();
    });
  });
});
