import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AccountModule,
    AuthModule,
    DatabaseModule,
    PermissionModule,
    RoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
