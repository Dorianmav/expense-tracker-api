import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subscription } from '../../models/subscription.model';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [SequelizeModule.forFeature([Subscription])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
