import { Module } from '@nestjs/common';
import { MailingServiceController } from './mailing-service.controller';
import { MailingService } from './mailing-service.service';

@Module({
  controllers: [MailingServiceController],
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingServiceModule {}
