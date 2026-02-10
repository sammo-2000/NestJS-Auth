import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Account } from 'src/account/entities/account.entity';
import { CONFIG, PROVIDERS } from 'src/constants';
import { RoleService } from 'src/role/role.service';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PROVIDERS.account)
    private accountRepository: Repository<Account>,
    private roleService: RoleService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const account = await this.getByEmailForLogin(loginDto.email);

    if (!account) {
      throw new UnauthorizedException('invalid credentials');
    }

    if (account.isActive === false) {
      throw new ForbiddenException('account is disabled');
    }

    if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException('account is temporarily locked');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      account.password,
    );

    if (!isPasswordValid) {
      account.loginAttempts = account.loginAttempts + 1;
      await this.accountRepository.save(account);

      throw new UnauthorizedException('invalid credentials');
    }

    account.lockedUntil = null;
    account.loginAttempts = 0;
    this.accountRepository.save(account);

    const { password, lockedUntil, isActive, ...safeUser } = account;

    return {
      user: safeUser,
      accessToken: await this.jwtService.signAsync({
        id: account.id,
      }),
    };
  }

  async signup(signupDto: SignupDto) {
    const account = await this.getByEmailForLogin(signupDto.email);
    if (account) {
      throw new ConflictException('email already in use');
    }
    const hashedPassword = await this.hashPassword(signupDto.password);
    const newAccount = await this.create({
      ...signupDto,
      password: hashedPassword,
    });
    return {
      message: ['account created successfully'],
      data: {
        account: newAccount,
      },
    };
  }

  async create(signupDto: SignupDto) {
    const count = await this.accountRepository.count();

    const roleName = count === 0 ? 'Admin' : 'Default';
    const role = await this.roleService.findByName(roleName);

    const account = this.accountRepository.create({
      ...signupDto,
      role,
    });

    return await this.accountRepository.save(account);
  }

  async getByEmailForLogin(email: string) {
    return this.accountRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'loginAttempts',
        'lockedUntil',
        'isActive',
      ],
    });
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, CONFIG.auth.saltOrRounds);
  }
}
