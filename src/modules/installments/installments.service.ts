import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Installment } from '../../models/installment.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import { InstallmentCreationAttributes } from '../../types/interfaces';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import { generateInstallmentDueDates, parseFrenchDate, parseFrenchDateArray } from '../../utils';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectModel(Installment)
    private installmentModel: typeof Installment,
    @InjectModel(InstallmentOccurrence)
    private installmentOccurrenceModel: typeof InstallmentOccurrence,
  ) {}

  async create(createInstallmentDto: CreateInstallmentDto): Promise<Installment> {
    const startDate = parseFrenchDate(createInstallmentDto.startDate);
    const customPaymentDates = createInstallmentDto.customPaymentDates
      ? parseFrenchDateArray(createInstallmentDto.customPaymentDates)
      : undefined;

    const installmentData: InstallmentCreationAttributes = {
      name: createInstallmentDto.name,
      totalAmount: createInstallmentDto.totalAmount,
      numberOfPayments: createInstallmentDto.numberOfPayments,
      startDate,
      isCompleted: createInstallmentDto.isCompleted || false,
      nextPaymentDate: createInstallmentDto.nextPaymentDate
        ? parseFrenchDate(createInstallmentDto.nextPaymentDate)
        : startDate,
      customPaymentDates,
      categoryId: createInstallmentDto.categoryId,
      bankId: createInstallmentDto.bankId,
    };

    const installment = await this.installmentModel.create(installmentData);
    await this.ensureOccurrences(installment);
    return this.findOne(installment.id);
  }

  async findAll(): Promise<Installment[]> {
    return this.installmentModel.findAll({
      include: [{ model: InstallmentOccurrence, as: 'occurrences', required: false }],
      order: [['name', 'ASC']],
    });
  }

  async findActive(): Promise<Installment[]> {
    return this.installmentModel.findAll({
      where: { isCompleted: false },
      include: [
        {
          model: InstallmentOccurrence,
          as: 'occurrences',
          required: true,
          where: { status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] } },
        },
      ],
      order: [[{ model: InstallmentOccurrence, as: 'occurrences' }, 'dueDate', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Installment> {
    const installment = await this.installmentModel.findByPk(id, {
      include: [{ model: InstallmentOccurrence, as: 'occurrences', required: false }],
      order: [[{ model: InstallmentOccurrence, as: 'occurrences' }, 'occurrenceNumber', 'ASC']],
    });

    if (!installment) {
      throw new NotFoundException(`Paiement echelonne avec l'ID ${id} non trouve`);
    }

    return installment;
  }

  async update(id: number, updateInstallmentDto: UpdateInstallmentDto): Promise<Installment> {
    const installment = await this.findOne(id);
    const updateData: Partial<InstallmentCreationAttributes> = {};

    if (updateInstallmentDto.name !== undefined) updateData.name = updateInstallmentDto.name;
    if (updateInstallmentDto.totalAmount !== undefined)
      updateData.totalAmount = updateInstallmentDto.totalAmount;
    if (updateInstallmentDto.numberOfPayments !== undefined) {
      updateData.numberOfPayments = updateInstallmentDto.numberOfPayments;
    }
    if (updateInstallmentDto.isCompleted !== undefined)
      updateData.isCompleted = updateInstallmentDto.isCompleted;
    if (updateInstallmentDto.categoryId !== undefined)
      updateData.categoryId = updateInstallmentDto.categoryId;
    if (updateInstallmentDto.bankId !== undefined) updateData.bankId = updateInstallmentDto.bankId;

    if (updateInstallmentDto.startDate) {
      updateData.startDate = parseFrenchDate(updateInstallmentDto.startDate);
    }

    if (updateInstallmentDto.nextPaymentDate) {
      updateData.nextPaymentDate = parseFrenchDate(updateInstallmentDto.nextPaymentDate);
    }

    if (updateInstallmentDto.customPaymentDates) {
      updateData.customPaymentDates = parseFrenchDateArray(updateInstallmentDto.customPaymentDates);
    }

    await installment.update(updateData);
    await this.ensureOccurrences(installment);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const installment = await this.findOne(id);
    await installment.destroy();
  }

  async markAsCompleted(id: number): Promise<Installment> {
    const installment = await this.findOne(id);
    await this.installmentOccurrenceModel.update(
      { status: OccurrenceStatus.PAID },
      {
        where: {
          installmentId: id,
          status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
        },
      },
    );
    await installment.update({ isCompleted: true, nextPaymentDate: null });
    return this.findOne(id);
  }

  async processPayment(id: number, paymentAmount: number): Promise<Installment> {
    await this.findOne(id);
    const occurrence = await this.installmentOccurrenceModel.findOne({
      where: {
        installmentId: id,
        status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
      },
      order: [['dueDate', 'ASC']],
    });

    if (!occurrence) {
      throw new NotFoundException(`Aucune occurrence a payer pour le paiement echelonne ${id}`);
    }

    await occurrence.update({
      amount: paymentAmount,
      paidDate: new Date(),
      status: OccurrenceStatus.PAID,
    });

    await this.refreshCompletion(id);
    return this.findOne(id);
  }

  async getNextPaymentDate(id: number): Promise<Date | null> {
    await this.findOne(id);
    const occurrence = await this.installmentOccurrenceModel.findOne({
      where: {
        installmentId: id,
        status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
      },
      order: [['dueDate', 'ASC']],
    });

    return occurrence?.dueDate ?? null;
  }

  async getAllUpcomingPayments(id: number): Promise<Date[]> {
    await this.findOne(id);
    const occurrences = await this.installmentOccurrenceModel.findAll({
      where: {
        installmentId: id,
        status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
      },
      order: [['dueDate', 'ASC']],
    });

    return occurrences.map((occurrence) => occurrence.dueDate);
  }

  private async ensureOccurrences(installment: Installment): Promise<void> {
    const dueDates = generateInstallmentDueDates(
      new Date(installment.startDate),
      installment.numberOfPayments,
      installment.customPaymentDates,
    );
    const amount = Number(
      (Number(installment.totalAmount) / installment.numberOfPayments).toFixed(2),
    );

    for (let index = 0; index < dueDates.length; index++) {
      const dueDate = dueDates[index];
      await this.installmentOccurrenceModel.findOrCreate({
        where: {
          installmentId: installment.id,
          occurrenceNumber: index + 1,
        },
        defaults: {
          installmentId: installment.id,
          occurrenceNumber: index + 1,
          dueDate,
          amount,
          status: dueDate < new Date() ? OccurrenceStatus.LATE : OccurrenceStatus.PENDING,
        },
      });
    }
  }

  private async refreshCompletion(installmentId: number): Promise<void> {
    const remaining = await this.installmentOccurrenceModel.count({
      where: {
        installmentId,
        status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
      },
    });

    await this.installmentModel.update(
      { isCompleted: remaining === 0 },
      { where: { id: installmentId } },
    );
  }
}
