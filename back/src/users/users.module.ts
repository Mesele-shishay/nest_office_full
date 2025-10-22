import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminAssignmentController } from './controllers/admin-assignment.controller';
import { AdminAssignmentService } from './services/admin-assignment.service';
import { User } from './entities/user.entity';
import { OfficeModule } from '../office/office.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, OfficeModule],
  controllers: [UsersController, AdminAssignmentController],
  providers: [UsersService, AdminAssignmentService],
  exports: [UsersService, AdminAssignmentService], // Export services so other modules can use them
})
export class UsersModule {}
