import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { hasAccess, Permissions } from './permissions';

@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Get all permissions
   *
   * Requires either:
   * - ROLE_MANAGE
   * - ROLE_READ
   *
   * Returns a complete list of permissions grouped by resource
   */
  @Get()
  @ApiOperation({
    summary: 'Get all permissions list',
    description: 'Requires ROLE_MANAGE or ROLE_READ permission',
  })
  @ApiOkResponse({
    description: 'List of all permissions grouped by resource',
    schema: {
      example: {
        ACCOUNT: {
          MANAGE: 'MANAGE_ACCOUNT',
          CREATE: 'CREATE_ACCOUNT',
          READ: 'READ_ACCOUNT',
          UPDATE: 'UPDATE_ACCOUNT',
          DELETE: 'DELETE_ACCOUNT',
        },
        ROLE: {
          MANAGE: 'MANAGE_ROLE',
          CREATE: 'CREATE_ROLE',
          READ: 'READ_ROLE',
          UPDATE: 'UPDATE_ROLE',
          DELETE: 'DELETE_ROLE',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: user lacks required permissions',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Get()
  findAll(@Request() request) {
    if (
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.READ)
    ) {
      return this.permissionService.findAll();
    }

    throw new UnauthorizedException();
  }
}
