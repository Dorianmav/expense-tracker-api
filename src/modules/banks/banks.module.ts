import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bank } from '../../models/bank.model';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';

@Module({
  imports: [SequelizeModule.forFeature([Bank])],
  controllers: [BanksController],
  providers: [BanksService],
  exports: [BanksService],
})
export class BanksModule {}
