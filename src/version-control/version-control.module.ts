import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionControl } from './entities/version-control.entity';
import { VersionControlController } from './version-control.controller';
import { VersionControlService } from './version-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([VersionControl])],
  controllers: [VersionControlController],
  providers: [VersionControlService],
})
export class VersionControlModule {}
