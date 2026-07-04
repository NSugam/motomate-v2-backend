import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SharedVehicle,
  SharedVehiclePermissionENUM,
  SharedVehicleStatusENUM,
} from 'src/app/shared-vehicle/entities/shared-vehicle.entity';
import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VehicleAccessHelper {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,

    @InjectRepository(SharedVehicle)
    private readonly sharedRepo: Repository<SharedVehicle>,
  ) {}

  async validateAccess(
    userId: string,
    vehicleId: string,
    requiredPermission: SharedVehiclePermissionENUM,
  ): Promise<void> {
    const vehicle = await this.vehicleRepo.findOne({
      where: {
        id: vehicleId,
        user: { id: userId },
      },
    });

    // Owner has full access
    if (vehicle) return;

    const shared = await this.sharedRepo.findOne({
      where: {
        vehicleId,
        sharedWithUserId: userId,
        status: SharedVehicleStatusENUM.ACCEPTED,
      },
    });

    if (!shared) {
      throw new ForbiddenException(
        `You do not have permission to ${requiredPermission.toLowerCase()} this vehicle.`,
      );
    }

    if (shared.permission === SharedVehiclePermissionENUM.EDIT) return;

    if (
      requiredPermission === SharedVehiclePermissionENUM.VIEW &&
      shared.permission === SharedVehiclePermissionENUM.VIEW
    ) {
      return;
    }

    throw new ForbiddenException(
      `You do not have permission to ${requiredPermission.toLowerCase()} this vehicle.`,
    );
  }

  async getAccessType(
    userId: string,
    vehicleId: string,
  ): Promise<'OWNER' | 'SHARED:EDIT' | 'SHARED:VIEW' | null> {
    const vehicle = await this.vehicleRepo.findOne({
      where: {
        id: vehicleId,
        user: { id: userId },
      },
    });

    if (vehicle) return 'OWNER';

    const shared = await this.sharedRepo.findOne({
      where: {
        vehicleId,
        sharedWithUserId: userId,
        status: SharedVehicleStatusENUM.ACCEPTED,
      },
    });

    if (shared && shared.permission === SharedVehiclePermissionENUM.EDIT)
      return 'SHARED:EDIT';
    else if (shared && shared.permission === SharedVehiclePermissionENUM.VIEW)
      return 'SHARED:VIEW';

    return null;
  }
}
