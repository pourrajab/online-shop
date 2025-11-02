import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthMessage } from "src/common/enums/message.enum";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";
import { UserStatus } from "src/modules/user/enum/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { CookieKeys } from "src/common/enums/cookie.enum";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const isSkippedAuthorization = this.reflector.get<boolean>(
      SKIP_AUTH,
      context.getHandler()
    );
    if (isSkippedAuthorization) return true;

    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException(AuthMessage.LoginIsRequired);

    let user: UserEntity | null;
    try {
      user = await this.authService.validateAccessToken(token);
    } catch (err) {
      try {
        user = await this.authService.validateUsernameToken(token);
      } catch {
        throw new UnauthorizedException(AuthMessage.LoginIsRequired);
      }
    }

    request.user = user;

    if (request?.user?.status === UserStatus.Blocked) {
      throw new ForbiddenException(AuthMessage.Blocked);
    }

    return true;
  }

  protected extractToken(request: Request) {
    const { authorization } = request.headers;
    if (authorization && authorization?.trim() !== "") {
      const [bearer, token] = authorization.split(" ");
      if (bearer?.toLowerCase() === "bearer" && token && isJWT(token)) {
        return token;
      }
    }

    const cookieToken = request.cookies?.[CookieKeys.AccessToken];
    if (cookieToken && isJWT(cookieToken)) {
      return cookieToken;
    }

    return null;
  }
}
