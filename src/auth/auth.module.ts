import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from 'src/account/account.module';
import { accountProviders } from 'src/account/entities/account.provider';
import { CONFIG } from 'src/constants';
import { DatabaseModule } from 'src/database/database.module';
import { RoleModule } from 'src/role/role.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    RoleModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: CONFIG.auth.jwtExpires,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...accountProviders,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
