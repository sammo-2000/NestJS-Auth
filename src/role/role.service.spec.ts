import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS } from 'src/constants';
import { AllPermissions } from 'src/permission/permissions';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<Repository<Role>>;

  const ADMIN_ROLE_NAME = 'admin';
  const DEFAULT_ROLE_NAME = 'default';

  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PROVIDERS.role, useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get(PROVIDERS.role);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* ========================= FIND ========================= */
  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: 1, name: ADMIN_ROLE_NAME },
        { id: 2, name: DEFAULT_ROLE_NAME },
      ] as Role[];
      roleRepository.find.mockResolvedValue(roles);

      const result = await service.findAll();
      expect(result).toEqual(roles);
      expect(roleRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role if found', async () => {
      const role = { id: 1, name: ADMIN_ROLE_NAME } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      const result = await service.findOne(1);
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  /* ========================= CREATE ========================= */
  describe('create', () => {
    it('should create a new role', async () => {
      const dto = { name: 'Manager', permissions: ['READ'] };
      roleRepository.findOne.mockResolvedValue(null);
      roleRepository.create.mockReturnValue(dto as any);
      roleRepository.save.mockResolvedValue({ id: 1, ...dto } as Role);

      const result = await service.create(dto);
      expect(roleRepository.create).toHaveBeenCalledWith(dto);
      expect(roleRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should throw ConflictException if role name already exists', async () => {
      const dto = { name: ADMIN_ROLE_NAME, permissions: AllPermissions };
      roleRepository.findOne.mockResolvedValue({ id: 1, ...dto } as Role);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  /* ========================= UPDATE ========================= */
  describe('update', () => {
    it('should update a role', async () => {
      const role = { id: 2, name: 'Manager', permissions: [] } as Role;
      const updateDto = { name: 'Supervisor', permissions: ['READ'] };
      roleRepository.findOne.mockResolvedValue(role);
      roleRepository.save.mockResolvedValue({ ...role, ...updateDto });

      const result = await service.update(role.id, updateDto);
      expect(result.name).toBe(updateDto.name);
      expect(result.permissions).toEqual(updateDto.permissions);
    });

    it('should prevent changing Admin role name', async () => {
      const role = {
        id: 1,
        name: ADMIN_ROLE_NAME,
        permissions: AllPermissions,
      } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      await expect(
        service.update(role.id, { name: 'SuperAdmin' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent changing Default role name', async () => {
      const defaultRole = {
        id: 2,
        name: DEFAULT_ROLE_NAME,
        permissions: [],
      } as Role;
      roleRepository.findOne.mockResolvedValue(defaultRole);

      const updateDto = { name: 'Basic' };

      await expect(service.update(defaultRole.id, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should prevent removing permissions from Admin', async () => {
      const role = {
        id: 1,
        name: ADMIN_ROLE_NAME,
        permissions: AllPermissions,
      } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      await expect(
        service.update(role.id, { permissions: [] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /* ========================= REMOVE ========================= */
  describe('remove', () => {
    it('should delete a role that is not Admin/Default', async () => {
      const role = { id: 3, name: 'Manager' } as Role;
      roleRepository.findOne.mockResolvedValue(role);
      roleRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(role.id);
      expect(roleRepository.delete).toHaveBeenCalledWith(role.id);
      expect(result).toEqual({ deleted: true });
    });

    it('should prevent deleting Admin role', async () => {
      const role = { id: 1, name: ADMIN_ROLE_NAME } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      await expect(service.remove(role.id)).rejects.toThrow(ForbiddenException);
    });

    it('should prevent deleting Default role', async () => {
      const role = { id: 2, name: DEFAULT_ROLE_NAME } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      await expect(service.remove(role.id)).rejects.toThrow(ForbiddenException);
    });
  });

  /* ========================= FIND BY NAME ========================= */
  describe('findByName', () => {
    it('should return a role if found', async () => {
      const role = { id: 1, name: ADMIN_ROLE_NAME } as Role;
      roleRepository.findOne.mockResolvedValue(role);

      const result = await service.findByName(ADMIN_ROLE_NAME);
      expect(result).toEqual(role);
    });

    it('should throw if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.findByName('NonExistent')).rejects.toThrow();
    });
  });

  /* ========================= CREATE FIRST ONE ========================= */
  describe('createFirstOne', () => {
    it('should create Admin and Default roles if none exist', async () => {
      roleRepository.findAndCount.mockResolvedValue([[], 0]);

      const adminRole: Role = {
        id: 1,
        name: ADMIN_ROLE_NAME,
        permissions: AllPermissions,
      };

      const defaultRole: Role = {
        id: 2,
        name: DEFAULT_ROLE_NAME,
        permissions: [],
      };

      roleRepository.create
        .mockReturnValueOnce(adminRole)
        .mockReturnValueOnce(defaultRole);

      roleRepository.save.mockResolvedValue([adminRole, defaultRole] as any);

      await service.createFirstOne();

      expect(roleRepository.create).toHaveBeenCalledTimes(2);
      expect(roleRepository.save).toHaveBeenCalledWith([
        adminRole,
        defaultRole,
      ]);
    });

    it('should do nothing if roles already exist', async () => {
      roleRepository.findAndCount.mockResolvedValue([[], 2]);
      await service.createFirstOne();
      expect(roleRepository.create).not.toHaveBeenCalled();
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });
});
