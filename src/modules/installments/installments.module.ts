import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Installment } from '../../models/installment.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';

@Module({
  imports: [SequelizeModule.forFeature([Installment, InstallmentOccurrence])],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
