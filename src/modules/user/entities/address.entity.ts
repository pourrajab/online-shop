import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.Address)
export class AddressEntity extends BaseEntity {
  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  recipient_name: string;

  @Column()
  address_details: string;

  @Column({ nullable: true })
  plaque: string;

  @Column()
  postal_code: string;

  @Column({ nullable: true })
  secondary_phone: string;

  @Column({ default: false })
  is_default: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: UserEntity;
}
