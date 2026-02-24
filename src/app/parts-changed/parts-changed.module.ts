import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsChanged } from './entities/parts-changed.entity';
import { PartsChangedController } from './parts-changed.controller';
import { PartsChangedService } from './parts-changed.service';
import { Part } from '../part/entities/part.entity';
import { Servicing } from '../servicing/entities/servicing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartsChanged, Part, Servicing])],
  controllers: [PartsChangedController],
  providers: [PartsChangedService],
})
export class PartsChangedModule {}
