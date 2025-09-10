import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersTestController } from './users-test.controller';
import { UsersTestService } from './users-test.service';

@Module({
  controllers: [UsersController, UsersTestController],
  providers: [UsersService, UsersTestService],
  exports: [UsersService, UsersTestService],
})
export class UsersModule {}
