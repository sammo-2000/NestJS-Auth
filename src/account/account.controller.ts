import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRequest } from 'src/auth/auth.guard';
import { hasAccess, Permissions } from 'src/permission/permissions';
import { AccountService } from './account.service';

@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  /**
   * Get all accounts
   *
   * Requires either:
   * - ACCOUNT_MANAGE permission
   * - ACCOUNT_READ permission
   *
   * Returns a list of all accounts with role info
   */
  @Get()
  @ApiOperation({
    summary: 'Get all accounts',
    description: 'Requires ACCOUNT_MANAGE or ACCOUNT_READ permission',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accounts',
    schema: {
      example: [
        {
          id: 1,
          email: 'user@gmail.com',
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          createdAt: '2026-02-10T12:40:44.324Z',
          updatedAt: '2026-02-10T13:17:45.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  findAll(@Request() request) {
    if (
      hasAccess(request.user, Permissions.ACCOUNT.MANAGE) ||
      hasAccess(request.user, Permissions.ACCOUNT.READ)
    ) {
      return this.accountService.findAll();
    }

    throw new UnauthorizedException();
  }

  /**
   * Get one account by ID
   *
   * Requires either:
   * - ACCOUNT_MANAGE permission
   * - ACCOUNT_READ permission
   * - OR user requesting their own account
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get an account by ID',
    description:
      'Requires ACCOUNT_MANAGE or ACCOUNT_READ permission or access to own account',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    schema: {
      example: {
        id: 1,
        email: 'user@gmail.com',
        loginAttempts: 0,
        lockedUntil: null,
        isActive: true,
        createdAt: '2026-02-10T12:40:44.324Z',
        updatedAt: '2026-02-10T13:17:45.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
    schema: {
      example: {
        message: 'Account not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  findOne(@Request() request, @Param('id', ParseIntPipe) id: number) {
    const user: UserRequest = request.user;
    if (
      hasAccess(request.user, Permissions.ACCOUNT.MANAGE) ||
      hasAccess(request.user, Permissions.ACCOUNT.READ) ||
      id === user.id
    ) {
      return this.accountService.findOne(id);
    }

    throw new UnauthorizedException();
  }

  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: string, @Body() updateAccountDto: UpdateAccountDto) {
  //   return this.accountService.update(+id, updateAccountDto);
  // }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: string) {
  //   return this.accountService.remove(+id);
  // }
}
