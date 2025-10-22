import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

export class AdminSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@tugza.tech' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping...');

      return;
    }

    // Create admin user - password will be hashed by entity hooks
    const admin = userRepository.create({
      email: 'admin@office.com',
      password: 'Admin@123456', // Raw password - will be hashed by @BeforeInsert hook
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(admin);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@office.com');
    console.log('🔑 Password: Admin@123456');
    console.log('⚠️  Please change the password after first login!');
  }
}
