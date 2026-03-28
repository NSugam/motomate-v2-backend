import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { join } from 'path';
import { AuthModule } from './app/auth/auth.module';
import { FillupsModule } from './app/fillups/fillups.module';
import { PartModule } from './app/part/part.module';
import { PartsChangedModule } from './app/parts-changed/parts-changed.module';
import { PartsReminderModule } from './app/parts-reminder/parts-reminder.module';
import { rolePermissionEntity } from './app/rbac/entities/rolePermission.entity';
import { PermissionModule } from './app/rbac/permission/permission.module';
import { RbacModule } from './app/rbac/rbac.module';
import { RoleModule } from './app/rbac/role/role.module';
import { RouteModule } from './app/rbac/route/route.module';
import { ServiceReminderModule } from './app/service-reminder/service-reminder.module';
import { ServicingModule } from './app/servicing/servicing.module';
import { User } from './app/user/entities/user.entity';
import { UserModule } from './app/user/user.module';
import { VehicleModule } from './app/vehicle/vehicle.module';
import { typeOrmConfigs } from './config/db-config';
import { HealthModule } from './health/health.module';
import { SuccessResponseInterceptor } from './interceptor/response.interceptor';
import { MasterDataModule } from './master-data/master-data.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { VehicleMiddleware } from './middlewares/vehicle.middleware';
import { VersionControlModule } from './version-control/version-control.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfigs()),
    TypeOrmModule.forFeature([User, rolePermissionEntity]),
    ServeStaticModule.forRoot({
      serveStaticOptions: {},
      rootPath: join(__dirname, '..'),
    }),

    HealthModule,
    AuthModule,
    RoleModule,
    RouteModule,
    PermissionModule,
    RbacModule,
    UserModule,
    VehicleModule,
    PartModule,
    ServicingModule,
    PartsChangedModule,
    PartsReminderModule,
    ServiceReminderModule,
    VersionControlModule,
    FillupsModule,
    MasterDataModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    SuccessResponseInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, VehicleMiddleware)
      .exclude(
        { path: 'health-check', method: RequestMethod.HEAD },
        { path: 'health-check', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'master-data/model/*', method: RequestMethod.GET },
        { path: 'master-data/import-bikes', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
