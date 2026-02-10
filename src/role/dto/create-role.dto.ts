import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { AllPermissions, PermissionType } from 'src/permission/permissions';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Admin',
    description: 'Unique name of the role',
    type: String,
    required: true,
  })
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name cannot be empty' })
  name: string;

  @ApiProperty({
    type: [String],
    isArray: true,
    example: AllPermissions,
    description: 'List of permissions assigned to this role',
    required: true,
  })
  @IsArray({ message: 'Permissions must be an array' })
  @ArrayNotEmpty({ message: 'Permissions array cannot be empty' })
  @IsIn(AllPermissions, {
    each: true,
    message: 'Each permission must be valid',
  })
  permissions: PermissionType[];
}
