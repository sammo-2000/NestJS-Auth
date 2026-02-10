import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS } from 'src/constants';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;

  const mockAccountRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        AccountService,
        {
          provide: PROVIDERS.account,
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
