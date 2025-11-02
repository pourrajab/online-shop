import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  RoleFilterDto,
} from "./dto/role.dto";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionFilterDto,
} from "./dto/permission.dto";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  ValidationMessage,
} from "src/common/enums/message.enum";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { SystemRoles, SystemPermissions } from "./enums/permission.enum";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const {
      name,
      description,
      is_active = true,
      permissionIds = [],
    } = createRoleDto;

    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });
    if (existingRole) {
      throw new ConflictException(ConflictMessage.RoleExists);
    }

    let permissions: Permission[] = [];
    if (permissionIds.length > 0) {
      permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
    }

    const role = this.roleRepository.create({
      name,
      description,
      is_active,
      permissions,
    });

    const savedRole = await this.roleRepository.save(role);
    return {
      message: PublicMessage.RoleCreated,
      data: savedRole,
    };
  }

  async getAllRoles(filterDto: RoleFilterDto) {
    const { limit, page, skip } = paginationSolver({
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
    });
    const { search, is_active } = filterDto;

    const queryBuilder = this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permissions")
      .leftJoinAndSelect("role.users", "users");

    if (search) {
      queryBuilder.where("role.name LIKE :search", { search: `%${search}%` });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere("role.is_active = :is_active", { is_active });
    }

    const [roles, count] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("role.id", "DESC")
      .getManyAndCount();

    return {
      message: PublicMessage.RoleListRetrieved,
      data: roles,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  async getRoleById(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["permissions", "users"],
    });

    if (!role) {
      throw new NotFoundException(NotFoundMessage.RoleNotFound);
    }

    return {
      message: PublicMessage.RoleRetrieved,
      data: role,
    };
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["permissions"],
    });

    if (!role) {
      throw new NotFoundException(NotFoundMessage.RoleNotFound);
    }

    if (role.is_system) {
      throw new BadRequestException(
        ValidationMessage.SystemRoleCannotBeModified
      );
    }

    const { name, description, is_active, permissionIds = [] } = updateRoleDto;

    if (name && name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name },
      });
      if (existingRole) {
        throw new ConflictException(ConflictMessage.RoleExists);
      }
    }

    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      role.permissions = permissions;
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (is_active !== undefined) role.is_active = is_active;

    const updatedRole = await this.roleRepository.save(role);
    return {
      message: PublicMessage.RoleUpdated,
      data: updatedRole,
    };
  }

  async deleteRole(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!role) {
      throw new NotFoundException(NotFoundMessage.RoleNotFound);
    }

    if (role.is_system) {
      throw new BadRequestException(
        ValidationMessage.SystemRoleCannotBeDeleted
      );
    }

    if (role.users && role.users.length > 0) {
      throw new ConflictException(ConflictMessage.RoleHasUsers);
    }

    await this.roleRepository.remove(role);
    return {
      message: PublicMessage.RoleDeleted,
    };
  }

  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const { userId, roleId } = assignRoleDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(NotFoundMessage.NotFoundUser);
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(NotFoundMessage.RoleNotFound);
    }

    if (!role.is_active) {
      throw new BadRequestException(ValidationMessage.RoleInactive);
    }

    await this.userRepository.update(userId, {
      role: role.name,
      roleId: roleId,
    });

    return {
      message: PublicMessage.RoleAssigned,
      data: { user, role },
    };
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const {
      name,
      description,
      resource,
      action,
      is_active = true,
    } = createPermissionDto;

    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });
    if (existingPermission) {
      throw new ConflictException(ConflictMessage.PermissionExists);
    }

    const permission = this.permissionRepository.create({
      name,
      description,
      resource,
      action,
      is_active,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    return {
      message: PublicMessage.PermissionCreated,
      data: savedPermission,
    };
  }

  async getAllPermissions(filterDto: PermissionFilterDto) {
    const { limit, page, skip } = paginationSolver({
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
    });
    const { search, resource, action, is_active } = filterDto;

    const queryBuilder = this.permissionRepository
      .createQueryBuilder("permission")
      .leftJoinAndSelect("permission.roles", "roles");

    if (search) {
      queryBuilder.where("permission.name LIKE :search", {
        search: `%${search}%`,
      });
    }

    if (resource) {
      queryBuilder.andWhere("permission.resource = :resource", { resource });
    }

    if (action) {
      queryBuilder.andWhere("permission.action = :action", { action });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere("permission.is_active = :is_active", { is_active });
    }

    const [permissions, count] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("permission.id", "DESC")
      .getManyAndCount();

    return {
      message: PublicMessage.PermissionListRetrieved,
      data: permissions,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  async getPermissionById(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ["roles"],
    });

    if (!permission) {
      throw new NotFoundException(NotFoundMessage.PermissionNotFound);
    }

    return {
      message: PublicMessage.PermissionRetrieved,
      data: permission,
    };
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(NotFoundMessage.PermissionNotFound);
    }

    const { name, description, resource, action, is_active } =
      updatePermissionDto;

    if (name && name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name },
      });
      if (existingPermission) {
        throw new ConflictException(ConflictMessage.PermissionExists);
      }
    }

    if (name) permission.name = name;
    if (description !== undefined) permission.description = description;
    if (resource) permission.resource = resource;
    if (action) permission.action = action;
    if (is_active !== undefined) permission.is_active = is_active;

    const updatedPermission = await this.permissionRepository.save(permission);
    return {
      message: PublicMessage.PermissionUpdated,
      data: updatedPermission,
    };
  }

  async deletePermission(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ["roles"],
    });

    if (!permission) {
      throw new NotFoundException(NotFoundMessage.PermissionNotFound);
    }

    if (permission.roles && permission.roles.length > 0) {
      throw new ConflictException(ConflictMessage.PermissionHasRoles);
    }

    await this.permissionRepository.remove(permission);
    return {
      message: PublicMessage.PermissionDeleted,
    };
  }

  async initializeSystemData() {
    const systemPermissions = Object.values(SystemPermissions).map(
      (permission) => {
        const [resource, action] = permission.split(":");
        return this.permissionRepository.create({
          name: permission,
          resource: resource,
          action: action,
          is_active: true,
          is_system: true,
        });
      }
    );

    await this.permissionRepository.save(systemPermissions);

    const superadminRole = this.roleRepository.create({
      name: SystemRoles.SUPERADMIN,
      description: "دسترسی کامل به تمام بخش‌ها",
      is_active: true,
      is_system: true,
      permissions: systemPermissions,
    });

    const adminRole = this.roleRepository.create({
      name: SystemRoles.ADMIN,
      description: "مدیر سیستم",
      is_active: true,
      is_system: true,
      permissions: systemPermissions.filter(
        (p) => !p.name.includes("roles:") && !p.name.includes("permissions:")
      ),
    });

    const userRole = this.roleRepository.create({
      name: SystemRoles.USER,
      description: "کاربر عادی",
      is_active: true,
      is_system: true,
      permissions: systemPermissions.filter(
        (p) =>
          p.name.includes("users:read") ||
          p.name.includes("products:read") ||
          p.name.includes("orders:create") ||
          p.name.includes("orders:read") ||
          p.name.includes("support:create") ||
          p.name.includes("support:read")
      ),
    });

    await this.roleRepository.save([superadminRole, adminRole, userRole]);

    return {
      message: PublicMessage.SystemInitialized,
    };
  }
}
