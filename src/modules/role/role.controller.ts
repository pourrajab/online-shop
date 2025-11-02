import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { RoleService } from "./role.service";
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
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { RoleGuard } from "src/modules/auth/guards/role.guard";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@ApiTags("Role Management")
@Controller("role")
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth("Authorization")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "ایجاد نقش جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @CanAccess(Roles.Superadmin, Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست نقش‌ها" })
  async getAllRoles(@Query() filterDto: RoleFilterDto) {
    return this.roleService.getAllRoles(filterDto);
  }

  @Get(":id")
  @CanAccess(Roles.Superadmin, Roles.Admin)
  @ApiOperation({ summary: "دریافت نقش خاص" })
  async getRoleById(@Param("id") id: string) {
    return this.roleService.getRoleById(+id);
  }

  @Patch(":id")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "بروزرسانی نقش" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateRole(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.roleService.updateRole(+id, updateRoleDto);
  }

  @Delete(":id")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "حذف نقش" })
  async deleteRole(@Param("id") id: string) {
    return this.roleService.deleteRole(+id);
  }

  @Post("assign")
  @CanAccess(Roles.Superadmin, Roles.Admin)
  @ApiOperation({ summary: "تخصیص نقش به کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.roleService.assignRoleToUser(assignRoleDto);
  }

  @Post("permission")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "ایجاد مجوز جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.roleService.createPermission(createPermissionDto);
  }

  @Get("permission/list")
  @CanAccess(Roles.Superadmin, Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست مجوزها" })
  async getAllPermissions(@Query() filterDto: PermissionFilterDto) {
    return this.roleService.getAllPermissions(filterDto);
  }

  @Get("permission/:id")
  @CanAccess(Roles.Superadmin, Roles.Admin)
  @ApiOperation({ summary: "دریافت مجوز خاص" })
  async getPermissionById(@Param("id") id: string) {
    return this.roleService.getPermissionById(+id);
  }

  @Patch("permission/:id")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "بروزرسانی مجوز" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updatePermission(
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.roleService.updatePermission(+id, updatePermissionDto);
  }

  @Delete("permission/:id")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "حذف مجوز" })
  async deletePermission(@Param("id") id: string) {
    return this.roleService.deletePermission(+id);
  }

  @Post("initialize")
  @CanAccess(Roles.Superadmin)
  @ApiOperation({ summary: "مقداردهی اولیه نقش‌ها و مجوزهای سیستمی" })
  async initializeSystemData() {
    return this.roleService.initializeSystemData();
  }
}
