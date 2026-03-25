import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { FindOneFn } from 'src/common/orm.type';
import { env } from 'src/config/env';
import { Repository } from 'typeorm';
import { GenerateBikesDataDTO } from './dto/master-data.dto';
import { MasterData } from './entities/md_bikes.entity';

@Injectable()
export class MasterDataService {
  private readonly API_URL = 'https://api.api-ninjas.com/v1/motorcycles';
  private readonly API_KEY = env.API_NINJAS_KEY;

  constructor(
    @InjectRepository(MasterData)
    private readonly masterDataRepo: Repository<MasterData>,
  ) {}

  async getAllMakes(): Promise<[string[], number]> {
    const result: MasterData[] = await this.masterDataRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.make', 'make')
      .orderBy('m.make', 'ASC')
      .getRawMany();

    const data = result.map((item) => item.make);

    return [data, data.length];
  }

  async getAllModels(make: string): Promise<[any[], number]> {
    const result = await this.masterDataRepo
      .createQueryBuilder('m')
      .select(['m.id AS id', `m.model AS name`, 'm.year AS year'])
      .where('m.make = :make', { make })
      .andWhere('m.model IS NOT NULL')
      .andWhere('m.year IS NOT NULL')
      .distinctOn(['m.model', 'm.year'])
      .orderBy('m.model', 'ASC')
      .addOrderBy('m.year', 'ASC')
      .addOrderBy('m.id', 'ASC')
      .getRawMany();

    return [result, result.length];
  }

  findOne: FindOneFn<MasterData> = (where, select, relations) => {
    return this.masterDataRepo.findOne({ where, select, relations });
  };

  async fetchAndStoreBike({
    make,
    model,
  }: GenerateBikesDataDTO): Promise<MasterData[]> {
    try {
      const response = await axios.get<MasterData[]>(this.API_URL, {
        params: { make, model },
        headers: { 'X-Api-Key': this.API_KEY },
      });

      const bikes = response.data;
      const savedBikes: MasterData[] = [];

      for (const bike of bikes) {
        // Check if bike already exists in DB
        const exists = await this.masterDataRepo.findOne({
          where: {
            make: bike.make,
            model: bike.model ?? null,
            year: bike.year ?? null,
          },
        });

        if (exists) {
          savedBikes.push(exists); // push existing record
          continue; // skip creation
        }

        const displacementValue = bike.displacement
          ? parseFloat(bike.displacement.split(' ')[0])
          : null;

        // create new entity
        const bikeEntity = this.masterDataRepo.create({
          make: bike.make,
          model: bike.model ?? null,
          year: bike.year ?? null,
          engine: bike.engine ?? null,
          power: bike.power ?? null,
          torque: bike.torque ?? null,
          cooling: bike.cooling ?? null,
          total_weight: bike.total_weight ?? null,
          displacement: String(displacementValue),
        });

        const saved = await this.masterDataRepo.save(bikeEntity);
        savedBikes.push(saved);
      }

      return savedBikes;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.error('General error:', err.message);
      } else {
        console.error('Unknown error:', err);
      }
      return [];
    }
  }
}
