import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToMany } from "typeorm";
import { Role } from "./role.entity";

@Entity({ name: EntityName.Permission })
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  resource: string; // e.g., "users", "products", "orders"

  @Column()
  action: string; // e.g., "create", "read", "update", "delete"

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
