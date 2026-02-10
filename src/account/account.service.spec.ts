import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS } from 'src/constants';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  const mockAccountRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PROVIDERS.account,
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
