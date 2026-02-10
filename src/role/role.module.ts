import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { roleProviders } from './entities/role.provider';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleController],
  providers: [RoleService, ...roleProviders],
  exports: [RoleService],
})
export class RoleModule {}
