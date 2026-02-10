import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Account } from 'src/account/entities/account.entity';
import { PROVIDERS } from 'src/constants';
import { RoleService } from 'src/role/role.service';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let accountRepository: jest.Mocked<Repository<Account>>;

  const mockAccountRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockRoleService = {
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    accountRepository = module.get(PROVIDERS.account);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.login).toBeDefined();
    expect(service.signup).toBeDefined();
  });

  /* ========================= LOGIN ========================= */

  describe('login', () => {
    it('should throw if account does not exist', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is incorrect', async () => {
      accountRepository.findOne.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 0,
      } as Account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(accountRepository.save).toHaveBeenCalled();
    });

    it('should throw if login attempts exceed limit', async () => {
      accountRepository.findOne.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 1000 * 60),
      } as Account);
      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if account is disabled', async () => {
      accountRepository.findOne.mockResolvedValue({
        email: 'test@test.com',
        isActive: false,
      } as Account);
      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reset login attempts on successful login', async () => {
      const account = {
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 3,
      } as Account;
      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await service.login({ email: 'test@test.com', password: '123456' });
      expect(account.loginAttempts).toBe(0);
      expect(accountRepository.save).toHaveBeenCalledWith(account);
    });

    it('should include user info in login response', async () => {
      const account = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
      } as Account;
      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login({
        email: 'test@test.com',
        password: '123456',
      });
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return a JWT token on successful login', async () => {
      const account = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
      } as Account;

      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.signAsync.mockReturnValue('mocked-jwt-token');

      const result = await service.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        id: 1,
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
    });

    it('should clear lockedUntil on successful login', async () => {
      const account = {
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 1,
        lockedUntil: new Date(Date.now() - 1000),
      } as Account;

      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      await service.login({ email: 'test@test.com', password: '123456' });

      expect(account.lockedUntil).toBeNull();
    });

    it('should not reset login attempts on failed login', async () => {
      const account = {
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 2,
      } as Account;

      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(account.loginAttempts).toBe(3);
    });

    it('should sign JWT with only allowed payload', async () => {
      const account = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
      } as Account;

      accountRepository.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      await service.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: 1 });

      const callArgs = mockJwtService.signAsync.mock.calls[0];
      expect(callArgs[0]).toEqual({ id: 1 });
      expect(callArgs[1]).toBeUndefined();
    });
  });

  /* ========================= SIGNUP ========================= */

  describe('signup', () => {
    it('should create a new account successfully', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      accountRepository.create.mockReturnValue({
        email: 'test@test.com',
        password: 'hashed',
      } as Account);
      accountRepository.save.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      } as Account);
      const result = await service.signup({
        email: 'test@test.com',
        password: '123456',
      });
      expect(result.message).toContain('account created successfully');
    });

    it('should throw if email is already in use', async () => {
      accountRepository.findOne.mockResolvedValue({} as Account);
      await expect(
        service.signup({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should not return password on signup response', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      accountRepository.create.mockReturnValue({
        email: 'test@test.com',
        password: 'hashed',
      } as Account);

      accountRepository.save.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
      } as Account);

      const result = await service.signup({
        email: 'test@test.com',
        password: '123456',
      });

      expect(result).not.toHaveProperty('password');
    });

    it('should hash the password before saving', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      await service.signup({
        email: 'test@test.com',
        password: '123456',
      });
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should save account with correct email', async () => {
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      await service.signup({
        email: 'test@test.com',
        password: '123456',
      });
      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@test.com' }),
      );
    });

    it('should create the first account as Admin', async () => {
      mockAccountRepository.count.mockResolvedValue(0);
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const adminRole = {
        id: 1,
        name: 'Admin',
        permissions: ['MANAGE_ACCOUNT'],
      };
      mockRoleService.findByName.mockResolvedValue(adminRole);

      accountRepository.create.mockImplementation((dto) =>
        Object.assign(new Account(), {
          ...dto,
          role: dto.role,
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      accountRepository.save.mockImplementation(async (acc: Account) => {
        return Object.assign(new Account(), acc, { id: acc.id ?? 1 });
      });

      const signupDto = { email: 'first@test.com', password: '123456' };
      const result = await service.signup(signupDto);

      expect(mockRoleService.findByName).toHaveBeenCalledWith('Admin');
      expect(result.data.account.role).toEqual(adminRole);
      expect(result.message).toContain('account created successfully');
    });

    it('should create subsequent accounts as Default role', async () => {
      accountRepository.count.mockResolvedValue(5);
      accountRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const defaultRole = { id: 2, name: 'Default', permissions: [] };
      mockRoleService.findByName.mockResolvedValue(defaultRole);

      accountRepository.create.mockImplementation((dto) =>
        Object.assign(new Account(), {
          ...dto,
          role: dto.role,
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      accountRepository.save.mockImplementation(async (acc: Account) => {
        return Object.assign(new Account(), acc, { id: acc.id ?? 2 });
      });

      const signupDto = { email: 'second@test.com', password: '123456' };
      const result = await service.signup(signupDto);

      expect(mockRoleService.findByName).toHaveBeenCalledWith('Default');
      expect(result.data.account.role).toEqual(defaultRole);
    });
  });
});
