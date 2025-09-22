import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Installment } from '../../models/installment.model';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import { InstallmentCreationAttributes } from '../../types/interfaces';
import { parseFrenchDate, parseFrenchDateArray } from '../../utils';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectModel(Installment)
    private installmentModel: typeof Installment,
  ) {}

  async create(createInstallmentDto: CreateInstallmentDto): Promise<Installment> {
    // Préparer les données pour Sequelize avec conversion de dates
    const installmentData: InstallmentCreationAttributes = {
      name: createInstallmentDto.name,
      totalAmount: createInstallmentDto.totalAmount,
      remainingAmount: createInstallmentDto.remainingAmount,
      numberOfPayments: createInstallmentDto.numberOfPayments,
      remainingPayments: createInstallmentDto.remainingPayments,
      isCompleted: createInstallmentDto.isCompleted || false,
      nextPaymentDate: createInstallmentDto.nextPaymentDate ? parseFrenchDate(createInstallmentDto.nextPaymentDate) : undefined,
      customPaymentDates: createInstallmentDto.customPaymentDates ? parseFrenchDateArray(createInstallmentDto.customPaymentDates) : undefined,
    };
    
    return this.installmentModel.create(installmentData);
  }


  async findAll(): Promise<Installment[]> {
    return this.installmentModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findActive(): Promise<Installment[]> {
    return this.installmentModel.findAll({
      where: { 
        isCompleted: false,
        remainingPayments: { [Op.gt]: 0 }
      },
      order: [['nextPaymentDate', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Installment> {
    const installment = await this.installmentModel.findByPk(id);

    if (!installment) {
      throw new NotFoundException(`Paiement échelonné avec l'ID ${id} non trouvé`);
    }

    return installment;
  }

  async update(id: number, updateInstallmentDto: UpdateInstallmentDto): Promise<Installment> {
    const installment = await this.findOne(id);
    
    // Préparer les données de mise à jour avec conversion de dates
    const updateData: Partial<InstallmentCreationAttributes> = {};
    
    // Copier les propriétés modifiées
    if (updateInstallmentDto.name !== undefined) updateData.name = updateInstallmentDto.name;
    if (updateInstallmentDto.totalAmount !== undefined) updateData.totalAmount = updateInstallmentDto.totalAmount;
    if (updateInstallmentDto.remainingAmount !== undefined) updateData.remainingAmount = updateInstallmentDto.remainingAmount;
    if (updateInstallmentDto.numberOfPayments !== undefined) updateData.numberOfPayments = updateInstallmentDto.numberOfPayments;
    if (updateInstallmentDto.remainingPayments !== undefined) updateData.remainingPayments = updateInstallmentDto.remainingPayments;
    if (updateInstallmentDto.isCompleted !== undefined) updateData.isCompleted = updateInstallmentDto.isCompleted;
    
    // Convertir les dates string en objets Date si fournies
    if (updateInstallmentDto.nextPaymentDate) {
      updateData.nextPaymentDate = parseFrenchDate(updateInstallmentDto.nextPaymentDate);
    }
    
    if (updateInstallmentDto.customPaymentDates) {
      updateData.customPaymentDates = parseFrenchDateArray(updateInstallmentDto.customPaymentDates);
    }
    
    await installment.update(updateData);
    return installment;
  }

  async remove(id: number): Promise<void> {
    const installment = await this.findOne(id);
    await installment.destroy();
  }

  async markAsCompleted(id: number): Promise<Installment> {
    const installment = await this.findOne(id);
    await installment.update({ 
      isCompleted: true,
      remainingPayments: 0,
      remainingAmount: 0,
      nextPaymentDate: undefined
    });
    return installment;
  }

  async processPayment(id: number, paymentAmount: number): Promise<Installment> {
    const installment = await this.findOne(id);
    
    const newRemainingAmount = Math.max(0, installment.remainingAmount - paymentAmount);
    const newRemainingPayments = Math.max(0, installment.remainingPayments - 1);
    
    let nextPaymentDate: Date | undefined = installment.nextPaymentDate;
    
    // Si des dates personnalisées sont définies, utiliser la prochaine date de la liste
    if (installment.customPaymentDates && installment.customPaymentDates.length > 0) {
      const currentPaymentIndex = installment.numberOfPayments - installment.remainingPayments;
      const nextPaymentIndex = currentPaymentIndex + 1;
      
      if (nextPaymentIndex < installment.customPaymentDates.length) {
        nextPaymentDate = new Date(installment.customPaymentDates[nextPaymentIndex]);
      } else {
        nextPaymentDate = undefined; // Plus de paiements programmés
      }
    } else if (newRemainingPayments > 0 && nextPaymentDate) {
      // Logique par défaut : ajouter 1 mois
      const nextDate = new Date(nextPaymentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextPaymentDate = nextDate;
    } else {
      nextPaymentDate = undefined;
    }

    await installment.update({
      remainingAmount: newRemainingAmount,
      remainingPayments: newRemainingPayments,
      nextPaymentDate,
      isCompleted: newRemainingPayments === 0
    });

    return installment;
  }

  async getNextPaymentDate(id: number): Promise<Date | null> {
    const installment = await this.findOne(id);
    
    if (installment.isCompleted || installment.remainingPayments === 0) {
      return null;
    }

    // Si des dates personnalisées sont définies
    if (installment.customPaymentDates && installment.customPaymentDates.length > 0) {
      const currentPaymentIndex = installment.numberOfPayments - installment.remainingPayments;
      
      if (currentPaymentIndex < installment.customPaymentDates.length) {
        return new Date(installment.customPaymentDates[currentPaymentIndex]);
      }
    }

    // Sinon, retourner la nextPaymentDate calculée automatiquement
    return installment.nextPaymentDate;
  }

  async getAllUpcomingPayments(id: number): Promise<Date[]> {
    const installment = await this.findOne(id);
    
    if (installment.isCompleted || installment.remainingPayments === 0) {
      return [];
    }

    const upcomingDates: Date[] = [];

    // Si des dates personnalisées sont définies
    if (installment.customPaymentDates && installment.customPaymentDates.length > 0) {
      const currentPaymentIndex = installment.numberOfPayments - installment.remainingPayments;
      
      for (let i = currentPaymentIndex; i < installment.customPaymentDates.length; i++) {
        upcomingDates.push(new Date(installment.customPaymentDates[i]));
      }
    } else {
      // Générer les dates automatiquement
      let currentDate = installment.nextPaymentDate ? new Date(installment.nextPaymentDate) : new Date();
      
      for (let i = 0; i < installment.remainingPayments; i++) {
        upcomingDates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return upcomingDates;
  }
}
