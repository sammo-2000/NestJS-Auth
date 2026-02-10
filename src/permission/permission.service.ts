import { Injectable } from '@nestjs/common';
import { Permissions } from './permissions';

@Injectable()
export class PermissionService {
  findAll() {
    return Permissions;
  }
}
