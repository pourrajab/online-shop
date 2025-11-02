import { UserEntity } from "src/modules/user/entities/user.entity";

export interface IUser {
  id: number;
  username?: string;
  email?: string;
  phone?: string;
  role: string;
  roleId?: number;
  status?: string;
  new_email?: string;
  new_phone?: string;
  verify_email?: boolean;
  verify_phone?: boolean;
  otpId?: number;
  profileId?: number;
  created_at: Date;
  updated_at: Date;
}

export {};
declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}
declare module "express-serve-static-core" {
  export interface Request {
    user?: IUser;
  }
}
