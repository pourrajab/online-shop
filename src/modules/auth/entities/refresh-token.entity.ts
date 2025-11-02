import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "refresh_tokens" })
export class RefreshTokenEntity extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  tokenHash: string;

  @Column({ type: "datetime" })
  expiresAt: Date;

  @Column({ type: "datetime", nullable: true })
  revokedAt: Date | null;
}
