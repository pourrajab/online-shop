import { config } from "dotenv";
import { join } from "path";
import { DataSource } from "typeorm";
config();
config({ path: join(process.cwd(), ".env") });

const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;
let dataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  password: DB_PASSWORD,
  username: DB_USERNAME,
  database: DB_NAME,
  port: +DB_PORT,
  synchronize: false,
  entities: ["dist/**/**/**/*.entity{.ts,.js}", "dist/**/**/*.entity{.ts,.js}"],
  migrations: ["dist/migrations/*{.ts,.js}"],
  migrationsTableName: "online_shop_migrations",
});

export default dataSource;
