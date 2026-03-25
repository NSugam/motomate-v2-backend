import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO } from 'src/common/dto';
import { GenerateBikesDataDTO } from './dto/master-data.dto';
import { MasterDataService } from './master-data.service';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('makes')
  async getAllMakes() {
    return this.masterDataService.getAllMakes();
  }

  @Get('models')
  async getAllModels(@Query('make') make: string) {
    return this.masterDataService.getAllModels(make);
  }

  @Get('model/:id')
  @ApiOperation({ summary: 'Find bike details by ID' })
  findOne(@Param() { id }: IdDTO) {
    return this.masterDataService.findOne({ id }, []);
  }

  // Example: GET /motorcycles?make=Kawasaki&model=Ninja
  @Get('import-bikes')
  async importMotorcycles(@Query() { make, model }: GenerateBikesDataDTO) {
    if (!make) return { success: false, message: 'Make is required' };
    const bikes = await this.masterDataService.fetchAndStoreBike({
      make,
      model,
    });
    return { success: true, count: bikes.length, data: bikes };
  }
}
