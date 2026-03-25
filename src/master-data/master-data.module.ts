import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterData } from './entities/md_bikes.entity';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterData])],

  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
