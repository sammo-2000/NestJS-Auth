import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDERS } from 'src/constants';
import { AllPermissions } from 'src/permission/permissions';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  private readonly ADMIN_ROLE_NAME = 'admin';
  private readonly DEFAULT_ROLE_NAME = 'default';

  constructor(
    @Inject(PROVIDERS.role)
    private roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.createFirstOne();
    await this.ensureAdminHasAllPermissions();
  }

  async findAll() {
    return this.roleRepository.find();
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const nameTaken = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (nameTaken) {
      throw new ConflictException(
        `role with name ${createRoleDto.name} already exists`,
      );
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);

    // Prevent Admin role name change
    if (
      role.name === this.ADMIN_ROLE_NAME &&
      updateRoleDto.name &&
      updateRoleDto.name !== this.ADMIN_ROLE_NAME
    ) {
      throw new ForbiddenException(`Admin role name cannot be changed`);
    }

    // Prevent Default role name change
    if (
      role.name === this.DEFAULT_ROLE_NAME &&
      updateRoleDto.name &&
      updateRoleDto.name !== this.DEFAULT_ROLE_NAME
    ) {
      throw new ForbiddenException(`Default role name cannot be changed`);
    }

    // Prevent removing permissions from Admin
    if (
      role.name === this.ADMIN_ROLE_NAME &&
      updateRoleDto.permissions &&
      updateRoleDto.permissions.sort().join(',') !==
        AllPermissions.sort().join(',')
    ) {
      throw new ForbiddenException(
        `Admin role must always have all permissions`,
      );
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);

    if (
      role.name === this.ADMIN_ROLE_NAME ||
      role.name === this.DEFAULT_ROLE_NAME
    ) {
      throw new ForbiddenException(`Cannot delete Admin or Default roles`);
    }

    await this.roleRepository.delete(id);
    return { deleted: true };
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      throw new InternalServerErrorException(`Role "${name}" not found`);
    }
    return role;
  }

  async createFirstOne() {
    const [roles, count] = await this.roleRepository.findAndCount();
    if (count > 0) return;

    const adminRole = this.roleRepository.create({
      name: this.ADMIN_ROLE_NAME,
      permissions: AllPermissions,
    });

    const defaultRole = this.roleRepository.create({
      name: this.DEFAULT_ROLE_NAME,
      permissions: [],
    });

    await this.roleRepository.save([adminRole, defaultRole]);
    console.log('Created initial Admin and Default roles');
  }

  private async ensureAdminHasAllPermissions() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: this.ADMIN_ROLE_NAME },
    });

    if (!adminRole) {
      const newAdmin = this.roleRepository.create({
        name: this.ADMIN_ROLE_NAME,
        permissions: AllPermissions,
      });
      await this.roleRepository.save(newAdmin);
      console.log('Admin role created with all permissions');
      return;
    }

    const missingPermissions = AllPermissions.filter(
      (perm) => !adminRole.permissions.includes(perm),
    );

    if (missingPermissions.length > 0) {
      adminRole.permissions = [...adminRole.permissions, ...missingPermissions];
      await this.roleRepository.save(adminRole);
      console.log(
        `Admin role updated with missing permissions: ${missingPermissions.join(
          ', ',
        )}`,
      );
    }
  }
}
