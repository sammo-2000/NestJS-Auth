import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS } from 'src/constants';
import { RoleService } from 'src/role/role.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAccountRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockRoleService = {
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PROVIDERS.account,
          useValue: mockAccountRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        { provide: RoleService, useValue: mockRoleService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller.login).toBeDefined();
    expect(controller.signup).toBeDefined();
  });
});
