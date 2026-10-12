import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { generateOTP } from 'src/helper/otp.generator';
import { VehicleService } from 'src/app/vehicle/vehicle.service';
import { FindAndCountFn, FindOrFailFn } from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Fillups } from '../fillups/entities/fillup.entity';
import { Part } from '../part/entities/part.entity';
import { PartsChanged } from '../parts-changed/entities/parts-changed.entity';
import { PartsReminder } from '../parts-reminder/entities/parts-reminder.entity';
import { Servicing } from '../servicing/entities/servicing.entity';
import { UploadService } from '../upload/upload.service';
import { ChangePasswordDTO, UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoggedInUser, UserRoleENUM } from './user.type';
import { UserDevice } from './entities/user.device.entity';
import { MailingService } from '../mailing-service/mailing-service.service';
import { generateOTPTemplate } from '../mailing-service/email.templates';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly vehicleService: VehicleService,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
    @InjectRepository(UserDevice)
    private deviceRepo: Repository<UserDevice>,
    private readonly mailingService: MailingService,
    private readonly redisService: RedisService,
  ) {}

  getProfile(user: LoggedInUser) {
    return {
      message: 'Logged-In User Data',
      user,
    };
  }

  async sendDeviceOtp(emailId: string) {
    const otpCode = generateOTP(6);
    const normalizedEmail = emailId.trim().toLowerCase();

    console.log('[OTP] Starting OTP process');

    try {
      console.log('[OTP] Saving OTP to Redis...');

      await this.redisService.set(
        `device-reset-otp:${normalizedEmail}`,
        otpCode,
        15,
      );

      console.log('[OTP] OTP saved to Redis successfully');

      console.log('[OTP] Sending email...');

      await this.mailingService.sendMail({
        email: normalizedEmail,
        subject: 'Your MotoMate Device Reset Verification OTP',
        message: generateOTPTemplate('there', otpCode),
      });

      console.log('[OTP] Email sent successfully');

      return {
        message: `OTP sent to ${normalizedEmail}`,
      };
    } catch (error) {
      console.error('[OTP] Error:', error);

      throw error;
    }
  }

  async resetDevice(email: string, otpCode: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `device-reset-otp:${normalizedEmail}`;
    const savedOtp = await this.redisService.get(key);

    if (!savedOtp || savedOtp !== otpCode) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const user = await this.userRepo.findOneBy({ email: normalizedEmail });
    if (!user) throw new NotFoundException('User not found.');

    await this.deviceRepo.delete({ user: { id: user.id } });
    await this.redisService.delete(key);

    return {
      message: 'All devices reset successfully.',
      success: true,
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

  async update(
    id: string,
    updateDetails: UpdateUserDto,
    deviceId?: string | null,
  ) {
    const userData = await this.userRepo.findOne({ where: { id } });

    if (!userData) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (
      userData.email === 'test@gmail.com' &&
      updateDetails.email &&
      updateDetails.email !== 'test@gmail.com'
    ) {
      throw new UnauthorizedException(
        'Unauthorised: Test account cannot be modified.',
      );
    }

    // Prevent modifying a test account (and don't update their role)
    if (userData.role === UserRoleENUM.TEST) {
      // remove role from updateDetails so it never updates
      if ('role' in updateDetails) {
        delete updateDetails.role;
      }

      throw new UnauthorizedException(
        'Unauthorised: Test account cannot be modified.',
      );
    }

    //defaultVehicleId should be updated only if it is not null
    if (
      updateDetails.defaultVehicleId !== undefined &&
      updateDetails.defaultVehicleId !== null
    ) {
      await this.vehicleService.findOrFail({
        id: updateDetails.defaultVehicleId,
      });
      userData.defaultVehicleId = updateDetails.defaultVehicleId;
    }

    if (updateDetails.ExpoToken) {
      const normalizedDeviceId = deviceId?.trim();
      const existingDeviceById = normalizedDeviceId
        ? await this.deviceRepo.findOne({
            where: {
              deviceId: normalizedDeviceId,
              user: { id: userData.id },
            },
          })
        : null;

      if (existingDeviceById) {
        existingDeviceById.expoToken = updateDetails.ExpoToken;
        await this.deviceRepo.save(existingDeviceById);
      } else {
        const existingDeviceByToken = await this.deviceRepo.findOne({
          where: {
            expoToken: updateDetails.ExpoToken,
          },
        });

        if (!existingDeviceByToken) {
          const device = this.deviceRepo.create({
            expoToken: updateDetails.ExpoToken,
            deviceId: normalizedDeviceId,
            user: userData,
          });

          await this.deviceRepo.save(device);
        } else if (normalizedDeviceId) {
          existingDeviceByToken.deviceId = normalizedDeviceId;
          await this.deviceRepo.save(existingDeviceByToken);
        }
      }
      delete updateDetails.ExpoToken;
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

    await this.userRepo.softDelete(user.id);
    return {
      message: `User: ${id} Deleted Successfully`,
      success: true,
    };
  }

  async deleteDevice(userId: string, deviceId: string) {
    const device = await this.deviceRepo.findOne({
      where: { deviceId, user: { id: userId } },
    });

    if (!device) throw new NotFoundException('Device not found');

    await this.deviceRepo.delete(device.id);

    return {
      message: 'Device deleted successfully',
      success: true,
    };
  }

  async permanentDelete(email: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { email },
        relations: ['vehicles', 'vehicles.vehicleImage'],
        withDeleted: true,
      });

      if (!user) throw new NotFoundException('User not found');

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new UnauthorizedException('Invalid password');

      for (const vehicle of user.vehicles || []) {
        if (vehicle.vehicleImage?.id) {
          await this.uploadService.deleteUpload(vehicle.vehicleImage.id, user);
        }
      }

      await queryRunner.manager.delete(Servicing, { userId: user.id });
      await queryRunner.manager.delete(PartsChanged, { userId: user.id });
      await queryRunner.manager.delete(PartsReminder, { userId: user.id });
      await queryRunner.manager.delete(Fillups, { userId: user.id });
      await queryRunner.manager.delete(Part, { userId: user.id });
      await queryRunner.manager.delete(User, user.id);
      await queryRunner.commitTransaction();

      return { message: 'Account deleted' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
