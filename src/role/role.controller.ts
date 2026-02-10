import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { hasAccess, Permissions } from 'src/permission/permissions';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Get all roles
   *
   * Requires either:
   * - ROLE_MANAGE
   * - ROLE_READ
   *
   * Returns list of roles with permissions
   */
  @Get()
  @ApiOperation({
    summary: 'Get all roles with permissions',
    description: 'Requires ROLE_MANAGE or ROLE_READ permission',
  })
  @ApiOkResponse({
    description: 'List of roles',
    schema: {
      example: [
        {
          id: 1,
          name: 'Admin',
          permissions: [
            'MANAGE_ACCOUNT',
            'CREATE_ACCOUNT',
            'READ_ACCOUNT',
            'UPDATE_ACCOUNT',
            'DELETE_ACCOUNT',
            'MANAGE_ROLE',
            'CREATE_ROLE',
            'READ_ROLE',
            'UPDATE_ROLE',
            'DELETE_ROLE',
          ],
        },
        {
          id: 2,
          name: 'Default',
          permissions: ['READ_ACCOUNT'],
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
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
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.READ)
    ) {
      return this.roleService.findAll();
    }

    throw new UnauthorizedException();
  }

  /**
   * Get a role by ID
   *
   * Requires either:
   * - ROLE_MANAGE
   * - ROLE_READ
   */
  @ApiOperation({
    summary: 'Get a role by ID',
    description: 'Requires ROLE_MANAGE or ROLE_READ permission',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiOkResponse({
    description: 'Role found',
    schema: {
      example: {
        id: 1,
        name: 'Admin',
        permissions: [
          'MANAGE_ACCOUNT',
          'CREATE_ACCOUNT',
          'READ_ACCOUNT',
          'UPDATE_ACCOUNT',
          'DELETE_ACCOUNT',
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    schema: {
      example: {
        message: 'Role with id 10 not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':id')
  findOne(@Request() request, @Param('id', ParseIntPipe) id: number) {
    if (
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.READ)
    ) {
      return this.roleService.findOne(+id);
    }

    throw new UnauthorizedException();
  }

  /**
   * Create a new role
   *
   * Requires:
   * - ROLE_MANAGE
   * - ROLE_CREATE
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new role with permissions',
    description: 'Requires ROLE_MANAGE or ROLE_CREATE permission',
  })
  @ApiCreatedResponse({
    description: 'Role created successfully',
    schema: {
      example: {
        id: 3,
        name: 'supervisor',
        permissions: ['MANAGE_ACCOUNT', 'CREATE_ACCOUNT'],
      },
    },
  })
  @ApiConflictResponse({
    description: 'Role with the same name already exists',
    schema: {
      example: {
        message: 'role with name Manager already exists',
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
            field: 'name',
            errors: ['Role name cannot be empty', 'Role name must be a string'],
          },
          {
            field: 'permissions',
            errors: [
              'Each permission must be valid',
              'Permissions array cannot be empty',
              'Permissions must be an array',
            ],
          },
        ],
      },
    },
  })
  @Post()
  create(@Request() request, @Body() dto: CreateRoleDto) {
    if (
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.CREATE)
    ) {
      return this.roleService.create(dto);
    }

    throw new UnauthorizedException();
  }

  /**
   * Update a role
   *
   * Cannot change Admin or Default role names
   * Cannot remove permissions from Admin
   *
   * Requires:
   * - ROLE_MANAGE
   * - ROLE_UPDATE
   */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role permissions or name',
    description:
      'Requires ROLE_MANAGE or ROLE_UPDATE permission. Admin or Default role names cannot be changed, Admin permissions cannot be removed.',
  })
  @ApiCreatedResponse({
    description: 'Role updated successfully',
    schema: {
      example: {
        id: 2,
        name: 'supervisor',
        permissions: ['MANAGE_ACCOUNT'],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    schema: {
      example: {
        message: 'Role with id 10 not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Changing admin permissions or names for admin and default user',
    schema: {
      example: {
        message: 'Default role name cannot be changed',
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
            field: 'permissions',
            errors: ['Each permission must be valid'],
          },
        ],
      },
    },
  })
  @Patch(':id')
  update(
    @Request() request,
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    if (
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.UPDATE)
    ) {
      return this.roleService.update(+id, dto);
    }

    throw new UnauthorizedException();
  }

  /**
   * Delete a role
   *
   * Cannot delete Admin or Default roles
   *
   * Requires:
   * - ROLE_MANAGE
   * - ROLE_DELETE
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Requires ROLE_MANAGE or ROLE_DELETE permission. Admin and Default roles cannot be deleted.',
  })
  @ApiOkResponse({
    description: 'Role deleted successfully',
    schema: { example: { deleted: true } },
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    schema: {
      example: {
        message: 'Role with id 10 not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Cannot delete Admin or Default roles, or invalid request data',
    schema: {
      example: {
        message: 'Cannot delete Admin or Default roles',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @Delete(':id')
  remove(@Request() request, @Param('id', ParseIntPipe) id: string) {
    if (
      hasAccess(request.user, Permissions.ROLE.MANAGE) ||
      hasAccess(request.user, Permissions.ROLE.DELETE)
    ) {
      return this.roleService.remove(+id);
    }

    throw new UnauthorizedException();
  }
}
