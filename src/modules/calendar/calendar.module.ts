import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Installment } from '../../models/installment.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { Subscription } from '../../models/subscription.model';
import { SubscriptionOccurrence } from '../../models/subscription-occurrence.model';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Subscription,
      SubscriptionOccurrence,
      Installment,
      InstallmentOccurrence,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
