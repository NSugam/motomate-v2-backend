import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsChanged } from '../parts-changed/entities/parts-changed.entity';
import { Part } from './entities/part.entity';
import { PartController } from './part.controller';
import { PartService } from './part.service';

@Module({
  imports: [TypeOrmModule.forFeature([Part, PartsChanged])],
  controllers: [PartController],
  providers: [PartService],
})
export class PartModule {}
