import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IUser } from "../types/request";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): IUser | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
);
