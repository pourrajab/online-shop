import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class Migration1762099901618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "username",
            type: "varchar",
            length: "255",
            isNullable: true,
            isUnique: true,
          },
          {
            name: "phone",
            type: "varchar",
            length: "255",
            isNullable: true,
            isUnique: true,
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: true,
            isUnique: true,
          },
          {
            name: "role",
            type: "varchar",
            length: "255",
            default: "'User'",
          },
          {
            name: "roleId",
            type: "int",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "new_email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "new_phone",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "verify_email",
            type: "boolean",
            default: false,
            isNullable: true,
          },
          {
            name: "verify_phone",
            type: "boolean",
            default: false,
            isNullable: true,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "otpId",
            type: "int",
            isNullable: true,
          },
          {
            name: "profileId",
            type: "int",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "profile",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "nick_name",
            type: "varchar",
            length: "255",
          },
          {
            name: "gender",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "birthday",
            type: "date",
            isNullable: true,
          },
          {
            name: "job",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "national_code",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "userId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "profile",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "otp",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "code",
            type: "varchar",
            length: "255",
          },
          {
            name: "expiresIn",
            type: "datetime",
          },
          {
            name: "userId",
            type: "int",
          },
          {
            name: "method",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "otp",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "address",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "province",
            type: "varchar",
            length: "255",
          },
          {
            name: "city",
            type: "varchar",
            length: "255",
          },
          {
            name: "recipient_name",
            type: "varchar",
            length: "255",
          },
          {
            name: "address_details",
            type: "text",
          },
          {
            name: "plaque",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "postal_code",
            type: "varchar",
            length: "255",
          },
          {
            name: "secondary_phone",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "is_default",
            type: "boolean",
            default: false,
          },
          {
            name: "userId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "address",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "category",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "image",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "imageKey",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "show",
            type: "boolean",
            default: true,
          },
          {
            name: "parentId",
            type: "int",
            isNullable: true,
          },
          {
            name: "priority",
            type: "int",
            default: 0,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "category",
      new TableForeignKey({
        columnNames: ["parentId"],
        referencedTableName: "category",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "product",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
          },
          {
            name: "code",
            type: "varchar",
            length: "255",
          },
          {
            name: "type",
            type: "enum",
            enum: ["تکی", "رنگ‌بندی", "سایزبندی"],
          },
          {
            name: "count",
            type: "int",
            default: 0,
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "discount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: true,
          },
          {
            name: "active_discount",
            type: "boolean",
            default: false,
            isNullable: true,
          },
          {
            name: "categoryId",
            type: "int",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "product",
      new TableForeignKey({
        columnNames: ["categoryId"],
        referencedTableName: "category",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "product_color",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "color_name",
            type: "varchar",
            length: "255",
          },
          {
            name: "color_code",
            type: "varchar",
            length: "255",
          },
          {
            name: "count",
            type: "int",
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "discount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "active_discount",
            type: "boolean",
            default: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "product_color",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "product_size",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "size",
            type: "varchar",
            length: "255",
          },
          {
            name: "count",
            type: "int",
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "discount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "active_discount",
            type: "boolean",
            default: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "product_size",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "product_detail",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "key",
            type: "varchar",
            length: "255",
          },
          {
            name: "value",
            type: "text",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "product_detail",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "product_image",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "url",
            type: "varchar",
            length: "500",
          },
          {
            name: "key",
            type: "varchar",
            length: "255",
          },
          {
            name: "sort",
            type: "int",
            default: 0,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "product_image",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "discount",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "code",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "percent",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "limit",
            type: "int",
            isNullable: true,
          },
          {
            name: "usage",
            type: "int",
            default: 0,
            isNullable: true,
          },
          {
            name: "expires_in",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "productId",
            type: "int",
            isNullable: true,
          },
          {
            name: "type",
            type: "enum",
            enum: ["product", "basket"],
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "basket",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "productId",
            type: "int",
            isNullable: true,
          },
          {
            name: "sizeId",
            type: "int",
            isNullable: true,
          },
          {
            name: "colorId",
            type: "int",
            isNullable: true,
          },
          {
            name: "discountId",
            type: "int",
            isNullable: true,
          },
          {
            name: "userId",
            type: "int",
            isNullable: true,
          },
          {
            name: "guestId",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "count",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "basket",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "basket",
      new TableForeignKey({
        columnNames: ["colorId"],
        referencedTableName: "product_color",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "basket",
      new TableForeignKey({
        columnNames: ["sizeId"],
        referencedTableName: "product_size",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "basket",
      new TableForeignKey({
        columnNames: ["discountId"],
        referencedTableName: "discount",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "basket",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "order",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "orderNumber",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "address",
            type: "text",
          },
          {
            name: "final_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "total_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "discount_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "status",
            type: "enum",
            enum: [
              "pending",
              "ordered",
              "packed",
              "in_transit",
              "delivered",
              "canceled",
            ],
            default: "'pending'",
          },
          {
            name: "paymentId",
            type: "int",
            isNullable: true,
          },
          {
            name: "userId",
            type: "int",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "order",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "order_items",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "orderId",
            type: "int",
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "colorId",
            type: "int",
            isNullable: true,
          },
          {
            name: "sizeId",
            type: "int",
            isNullable: true,
          },
          {
            name: "quantity",
            type: "int",
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedTableName: "order",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "product",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["colorId"],
        referencedTableName: "product_color",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["sizeId"],
        referencedTableName: "product_size",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "payment",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "status",
            type: "boolean",
            default: false,
          },
          {
            name: "invoice_number",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "refId",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "authority",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "orderId",
            type: "int",
            isNullable: true,
          },
          {
            name: "userId",
            type: "int",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "gateway",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "transaction_id",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "payment",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedTableName: "order",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "payment",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "order",
      new TableForeignKey({
        columnNames: ["paymentId"],
        referencedTableName: "payment",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "support_ticket",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "status",
            type: "enum",
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "'open'",
          },
          {
            name: "priority",
            type: "enum",
            enum: ["low", "medium", "high", "urgent"],
            default: "'medium'",
          },
          {
            name: "category",
            type: "enum",
            enum: ["general", "technical", "billing", "other"],
            default: "'general'",
          },
          {
            name: "userId",
            type: "int",
            isNullable: true,
          },
          {
            name: "assignedToId",
            type: "int",
            isNullable: true,
          },
          {
            name: "resolution",
            type: "text",
            isNullable: true,
          },
          {
            name: "resolvedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "closedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "support_ticket",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "support_ticket",
      new TableForeignKey({
        columnNames: ["assignedToId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "support_message",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "type",
            type: "enum",
            enum: ["text", "image", "file"],
            default: "'text'",
          },
          {
            name: "attachmentUrl",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "attachmentName",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "attachmentSize",
            type: "int",
            isNullable: true,
          },
          {
            name: "ticketId",
            type: "int",
            isNullable: true,
          },
          {
            name: "senderId",
            type: "int",
            isNullable: true,
          },
          {
            name: "isRead",
            type: "boolean",
            default: false,
          },
          {
            name: "readAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "support_message",
      new TableForeignKey({
        columnNames: ["ticketId"],
        referencedTableName: "support_ticket",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "support_message",
      new TableForeignKey({
        columnNames: ["senderId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "blog",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "image",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "255",
            default: "'draft'",
          },
          {
            name: "authorId",
            type: "int",
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "blog",
      new TableForeignKey({
        columnNames: ["authorId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "blog_category",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "blogId",
            type: "int",
          },
          {
            name: "categoryId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "blog_category",
      new TableForeignKey({
        columnNames: ["blogId"],
        referencedTableName: "blog",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_category",
      new TableForeignKey({
        columnNames: ["categoryId"],
        referencedTableName: "category",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "blog_comments",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "text",
            type: "text",
          },
          {
            name: "accepted",
            type: "boolean",
            default: true,
          },
          {
            name: "blogId",
            type: "int",
          },
          {
            name: "userId",
            type: "int",
          },
          {
            name: "parentId",
            type: "int",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "blog_comments",
      new TableForeignKey({
        columnNames: ["blogId"],
        referencedTableName: "blog",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_comments",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_comments",
      new TableForeignKey({
        columnNames: ["parentId"],
        referencedTableName: "blog_comments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "blog_likes",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "blogId",
            type: "int",
          },
          {
            name: "userId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "blog_likes",
      new TableForeignKey({
        columnNames: ["blogId"],
        referencedTableName: "blog",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_likes",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "blog_bookmarks",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "blogId",
            type: "int",
          },
          {
            name: "userId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "blog_bookmarks",
      new TableForeignKey({
        columnNames: ["blogId"],
        referencedTableName: "blog",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_bookmarks",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "tags",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "blog_tag",
        columns: [
          {
            name: "blogId",
            type: "int",
          },
          {
            name: "tagId",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.addPrimaryKey("blog_tag", ["blogId", "tagId"]);

    await queryRunner.createForeignKey(
      "blog_tag",
      new TableForeignKey({
        columnNames: ["blogId"],
        referencedTableName: "blog",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "blog_tag",
      new TableForeignKey({
        columnNames: ["tagId"],
        referencedTableName: "tags",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "role",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "is_system",
            type: "boolean",
            default: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "permission",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "resource",
            type: "varchar",
            length: "255",
          },
          {
            name: "action",
            type: "varchar",
            length: "255",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "is_system",
            type: "boolean",
            default: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "role_permissions",
        columns: [
          {
            name: "role_id",
            type: "int",
          },
          {
            name: "permission_id",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.addPrimaryKey("role_permissions", [
      "role_id",
      "permission_id",
    ]);

    await queryRunner.createForeignKey(
      "role_permissions",
      new TableForeignKey({
        columnNames: ["role_id"],
        referencedTableName: "role",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "role_permissions",
      new TableForeignKey({
        columnNames: ["permission_id"],
        referencedTableName: "permission",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "user",
      new TableForeignKey({
        columnNames: ["roleId"],
        referencedTableName: "role",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "refresh_tokens",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userId",
            type: "int",
          },
          {
            name: "tokenHash",
            type: "varchar",
            length: "255",
          },
          {
            name: "expiresAt",
            type: "datetime",
          },
          {
            name: "revokedAt",
            type: "datetime",
            isNullable: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "refresh_tokens",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      "refresh_tokens",
      "role_permissions",
      "permission",
      "role",
      "blog_tag",
      "tags",
      "blog_bookmarks",
      "blog_likes",
      "blog_comments",
      "blog_category",
      "blog",
      "support_message",
      "support_ticket",
      "payment",
      "order_items",
      "order",
      "basket",
      "discount",
      "product_image",
      "product_detail",
      "product_size",
      "product_color",
      "product",
      "category",
      "address",
      "otp",
      "profile",
      "user",
    ];

    for (const table of tables) {
      await queryRunner.dropTable(table, true, true, true);
    }
  }
}
