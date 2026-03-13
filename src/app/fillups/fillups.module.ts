import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fillups } from './entities/fillup.entity';
import { FillupsController } from './fillups.controller';
import { FillupsService } from './fillups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fillups])],
  controllers: [FillupsController],
  providers: [FillupsService],
})
export class FillupsModule {}
