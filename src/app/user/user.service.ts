import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { VehicleService } from 'src/app/vehicle/vehicle.service';
import { FindAndCountFn, FindOrFailFn } from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { EntityManager, Repository } from 'typeorm';
import { ChangePasswordDTO, UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoggedInUser, UserRoleENUM } from './user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly vehicleService: VehicleService,
  ) {}

  getProfile(user: LoggedInUser) {
    return {
      message: 'Logged-In User Data',
      user,
    };
  }

  findAndCount: FindAndCountFn<User> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.userRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  findOrFail: FindOrFailFn<User> = async (where, select, relations) => {
    try {
      return await this.userRepo.findOneOrFail({ where, select, relations });
    } catch {
      throw new NotFoundException(`User not found.`);
    }
  };

  async update(id: string, updateDetails: UpdateUserDto) {
    const userData = await this.userRepo.findOne({ where: { id } });

    if (
      userData.email === 'test@gmail.com' &&
      updateDetails.email !== 'test@gmail.com'
    ) {
      throw new UnauthorizedException(
        'Unauthorised: Test account cannot be modified.',
      );
    }

    if (!userData) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Prevent modifying an admin or super admin account (and don't update their role)
    if (
      userData.role === UserRoleENUM.ADMIN ||
      userData.role === UserRoleENUM.SUPER_ADMIN
    ) {
      // remove role from updateDetails so it never updates
      if ('role' in updateDetails) {
        delete updateDetails.role;
      }

      throw new UnauthorizedException(
        'Unauthorised: Admin or Super Admin account cannot be modified.',
      );
    }

    //defaultVehicleId should be updated only if it is not null
    if (updateDetails.defaultVehicleId) {
      await this.vehicleService.findOrFail({
        id: updateDetails.defaultVehicleId,
      });
      userData.defaultVehicleId = updateDetails.defaultVehicleId;
    }

    this.userRepo.merge(userData, updateDetails);
    await this.entityManager.save(userData);

    return {
      message: 'User details updated successfully',
      success: true,
      updateDetails,
    };
  }

  async changePassword(user: LoggedInUser, dto: ChangePasswordDTO) {
    const userData = await this.userRepo.findOne({
      where: { id: user.id },
    });

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    if (userData.email === 'test@gmail.com') {
      throw new UnauthorizedException(
        'Unauthorised: Test account cannot be modified.',
      );
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      userData.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const isSamePassword = await bcrypt.compare(
      dto.newPassword,
      userData.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password cannot be same as old password',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    userData.password = hashedPassword;
    await this.userRepo.save(userData);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }

  async deleteById(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    void this.userRepo.softDelete(user.id);
    return {
      message: `User: ${id} Deleted Successfully`,
      success: true,
    };
  }
}
