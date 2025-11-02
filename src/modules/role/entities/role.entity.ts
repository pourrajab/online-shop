import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Permission } from "./permission.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity({ name: EntityName.Role })
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean; // System roles cannot be deleted

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions: Permission[];

  @OneToMany(() => UserEntity, (user) => user.roleEntity)
  users: UserEntity[];
}
