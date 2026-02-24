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
import { AuthMiddleware } from './app/auth/auth.middleware';
import { AuthModule } from './app/auth/auth.module';
import { PartsChangedModule } from './app/parts-changed/parts-changed.module';
import { rolePermissionEntity } from './app/rbac/entities/rolePermission.entity';
import { PermissionModule } from './app/rbac/permission/permission.module';
import { RbacModule } from './app/rbac/rbac.module';
import { RoleModule } from './app/rbac/role/role.module';
import { RouteModule } from './app/rbac/route/route.module';
import { ServicingModule } from './app/servicing/servicing.module';
import { User } from './app/user/entities/user.entity';
import { UserModule } from './app/user/user.module';
import { VehicleModule } from './app/vehicle/vehicle.module';
import { typeOrmConfigs } from './config/db-config';
import { SuccessResponseInterceptor } from './interceptor/response.interceptor';

@Module({
  imports: [
    SentryModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfigs()),
    TypeOrmModule.forFeature([User, rolePermissionEntity]),
    ServeStaticModule.forRoot({
      serveStaticOptions: {},
      rootPath: join(__dirname, '..'),
    }),

    AuthModule,
    RoleModule,
    RouteModule,
    PermissionModule,
    RbacModule,
    UserModule,
    VehicleModule,
    ServicingModule,
    PartsChangedModule,
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
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/health-check', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
