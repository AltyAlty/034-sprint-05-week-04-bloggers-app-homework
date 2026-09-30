import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './api/auth/auth.controller';
import { SecurityDevicesController } from './api/security-devices/security-devices.controller';
import { UsersSAController } from './api/users/users-sa.controller';
import { AuthService } from './application/auth/auth.service';
import { UsersService } from './application/users/users.service';
import { SecurityDevicesQueryService } from './application/security-devices/security-devices.query-service';
import { UsersQueryService } from './application/users/users.query-service';
import { CommentsRepository } from '../blog/infrastructure/comments/comments.repository';
import { AuthRepository } from './infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from './infrastructure/security-devices/security-devices.repository';
import { UsersRepository } from './infrastructure/users/users.repository';
import { SecurityDevicesQueryRepository } from './infrastructure/security-devices/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { CoreModule } from '../../core/core.module';
import { AccessJwtAuthStrategy } from '../../core/guards/access-jwt-auth/access-jwt-auth.strategy';
import { LocalAuthStrategy } from '../../core/guards/local-auth/local-auth.strategy';
import { RefreshJwtAuthStrategy } from '../../core/guards/refresh-jwt-auth/refresh-jwt-auth.strategy';
import { AuthConfigModule } from './config/auth-config.module';

/*Модуль для пользователей.*/
@Module({
  imports: [AuthConfigModule, CoreModule, PassportModule.register({ defaultStrategy: 'access-jwt' })],
  controllers: [AuthController, SecurityDevicesController, UsersSAController],
  providers: [
    LocalAuthStrategy,
    AccessJwtAuthStrategy,
    RefreshJwtAuthStrategy,
    JwtService,
    AuthService,
    UsersService,
    SecurityDevicesQueryService,
    UsersQueryService,
    AuthRepository,
    SecurityDevicesRepository,
    UsersRepository,
    CommentsRepository,
    SecurityDevicesQueryRepository,
    UsersQueryRepository,
  ],
  exports: [AuthConfigModule, AccessJwtAuthStrategy, AuthService, UsersService],
})
export class UserModule {}
