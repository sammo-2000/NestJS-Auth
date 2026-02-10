import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   *
   * Allows a user to log in using email and password.
   * Returns the logged-in user info and JWT access token.
   *
   * Possible errors:
   * - Unauthorized (invalid credentials)
   * - Forbidden (account disabled or temporarily locked)
   * - BadRequest (validation errors)
   */
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@gmail.com',
          loginAttempts: 0,
        },
        accessToken: '...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Account disabled or temporarily locked',
    schema: {
      example: {
        message: 'account is disabled',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      example: {
        message: 'validation failed',
        errors: [
          {
            field: 'email',
            errors: [
              'Email must be valid',
              'Email cannot be empty',
              'email must be a string',
            ],
          },
          {
            field: 'password',
            errors: [
              'Password must be at least 5 characters long',
              'Password cannot be empty',
              'password must be a string',
            ],
          },
        ],
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Signup endpoint
   *
   * Allows a user to create a new account.
   * The first account will automatically be assigned the Admin role, subsequent accounts get Default role.
   *
   * Possible errors:
   * - Conflict (email already in use)
   * - BadRequest (validation errors)
   */
  @Post('signup')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    schema: {
      example: {
        message: ['account created successfully'],
        data: {
          account: {
            id: 1,
            email: 'user@gmail.com',
            role: {
              id: 1,
              name: 'Admin',
              permissions: [
                'MANAGE_ACCOUNT',
                'CREATE_ACCOUNT',
                'READ_ACCOUNT',
                '...',
              ],
            },
            loginAttempts: 0,
            lockedUntil: null,
            isActive: true,
            createdAt: '2026-02-10T13:36:38.459Z',
            updatedAt: '2026-02-10T13:36:38.459Z',
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already in use',
    schema: {
      example: {
        message: 'email already in use',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      example: {
        message: 'validation failed',
        errors: [
          {
            field: 'email',
            errors: [
              'Email must be valid',
              'Email cannot be empty',
              'email must be a string',
            ],
          },
          {
            field: 'password',
            errors: [
              'Password must be at least 5 characters long',
              'Password cannot be empty',
              'password must be a string',
            ],
          },
        ],
      },
    },
  })
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
