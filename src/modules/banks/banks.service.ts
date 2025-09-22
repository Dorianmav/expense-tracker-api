import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bank } from '../../models/bank.model';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BanksService {
  constructor(
    @InjectModel(Bank)
    private bankModel: typeof Bank,
  ) {}

  async create(createBankDto: CreateBankDto): Promise<Bank> {
    try {
      return await this.bankModel.create(createBankDto);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(`Une banque avec le nom "${createBankDto.name}" existe déjà`);
      }
      throw error;
    }
  }

  async findAll(): Promise<Bank[]> {
    return this.bankModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Bank> {
    const bank = await this.bankModel.findByPk(id);

    if (!bank) {
      throw new NotFoundException(`Banque avec l'ID ${id} non trouvée`);
    }

    return bank;
  }

  async update(id: number, updateBankDto: UpdateBankDto): Promise<Bank> {
    const bank = await this.findOne(id);
    
    try {
      await bank.update(updateBankDto);
      return bank;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(`Une banque avec le nom "${updateBankDto.name}" existe déjà`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const bank = await this.findOne(id);
    await bank.destroy();
  }
}
