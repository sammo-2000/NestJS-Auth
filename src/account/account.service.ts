import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDERS } from 'src/constants';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @Inject(PROVIDERS.account)
    private accountRepository: Repository<Account>,
  ) {}

  async findAll() {
    return this.accountRepository.find();
  }

  async findOne(id: number) {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException();
    }

    return account;
  }

  // async update(id: number, updateAccountDto: UpdateAccountDto) {
  //   await this.accountRepository.update(id, updateAccountDto);
  //   return this.findOne(id);
  // }

  // async remove(id: number) {
  //   await this.accountRepository.delete(id);
  //   return { deleted: true };
  // }

  async findOneWithPermissions(id: number) {
    return this.accountRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }
}
