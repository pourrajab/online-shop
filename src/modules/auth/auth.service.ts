import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { OtpAuthMethod } from "./enums/otp-method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../user/entities/profile.entity";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "../user/entities/otp.entity";
import { randomInt } from "crypto";
import { TokenService } from "./tokens.service";
import { Request, Response } from "express";
import { AuthResponse, GoogleUser } from "./types/response";
import { REQUEST } from "@nestjs/core";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { KavenegarService } from "../http/kavenegar.service";
import { randomId } from "src/common/utils/functions.util";
import * as bcrypt from "bcrypt";
import { PasswordLoginDto, PasswordRegisterDto } from "./dto/password.dto";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshRepository: Repository<RefreshTokenEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService,
    private kavenegarService: KavenegarService
  ) {}

  async registerWithPassword(passwordRegisterDto: PasswordRegisterDto) {
    try {
      const { username, password } = passwordRegisterDto;

      if (!username?.trim() || !password?.trim()) {
        throw new BadRequestException(AuthMessage.NotFoundAccount);
      }
      if (password.length < 8) {
        throw new BadRequestException(AuthMessage.PasswordTooShort);
      }

      let user = await this.userRepository.findOneBy({ username });
      if (user) {
        throw new ConflictException(AuthMessage.AlreadyExistAccount);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user = this.userRepository.create({ username, password: hashedPassword });
      user = await this.userRepository.save(user);

      const accessToken = this.tokenService.createUsernameToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return { message: PublicMessage.Created, accessToken, user };
    } catch (error) {
      console.error(
        "[AuthService] registerWithPassword error:",
        error?.message
      );
      throw error;
    }
  }

  async loginWithPassword(passwordLoginDto: PasswordLoginDto) {
    const { username, password } = passwordLoginDto;

    if (!username?.trim() || !password?.trim()) {
      throw new BadRequestException(AuthMessage.NotFoundAccount);
    }

    const user = await this.userRepository.findOneBy({ username });
    if (!user || !user.password) {
      throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessage.TryAgain);
    }

    const accessToken = this.tokenService.createUsernameToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });
    const refreshToken = this.tokenService.createRefreshToken({
      userId: user.id,
    });
    const refreshHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.refreshRepository.insert({
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt,
      revokedAt: null,
    });

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException(AuthMessage.LoginAgain);

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);

    const records = await this.refreshRepository.find({
      where: { userId: user.id, revokedAt: null },
    });
    const match = await Promise.any(
      records.map((r) =>
        bcrypt.compare(refreshToken, r.tokenHash).then((ok) => (ok ? r : null))
      )
    ).catch(() => null);
    if (!match) throw new UnauthorizedException(AuthMessage.LoginAgain);
    if (match.expiresAt < new Date())
      throw new UnauthorizedException(AuthMessage.LoginAgain);

    await this.refreshRepository.update(
      { id: match.id },
      { revokedAt: new Date() }
    );

    const accessToken = this.tokenService.createAccessToken({
      userId: user.id,
    });
    const newRefreshToken = this.tokenService.createRefreshToken({
      userId: user.id,
    });
    const newHash = await bcrypt.hash(newRefreshToken, 12);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.refreshRepository.insert({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      revokedAt: null,
    });

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        const records = await this.refreshRepository.find({
          where: { userId: payload.userId, revokedAt: null },
        });
        for (const record of records) {
          if (await bcrypt.compare(refreshToken, record.tokenHash)) {
            await this.refreshRepository.update(
              { id: record.id },
              { revokedAt: new Date() }
            );
            break;
          }
        }
      } catch {}
    }

    return {
      message: PublicMessage.LoggedOut,
    };
  }

  async userExistence(authDto: AuthDto, res: Response) {
    try {
      const { method, type, username } = authDto;
      console.log("[AuthService] userExistence input:", authDto);
      let result: AuthResponse;
      switch (type) {
        case AuthType.Login:
          result = await this.login(method, username);
          // await this.sendOtpOtp(method, username, result.code)
          return this.sendResponse(res, result);
        case AuthType.Register:
          result = await this.register(method, username);
          // await this.sendOtpOtp(method, username, result.code)
          return this.sendResponse(res, result);
        default:
          throw new UnauthorizedException();
      }
    } catch (error) {
      console.error("[AuthService] userExistence error:", error?.message);
      console.error(error?.stack);
      throw error;
    }
  }
  async login(method: OtpAuthMethod, username: string) {
    console.log("[AuthService] login method:", method, "username:", username);
    const validUsername = this.otpUsernameValidator(method, username);
    let user: UserEntity = await this.checkExistUserOtp(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.saveOtpOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }
  async register(method: OtpAuthMethod, username: string) {
    const validUsername = this.otpUsernameValidator(method, username);
    let user: UserEntity = await this.checkExistUserOtp(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);
    user = this.userRepository.create({
      [method]: username,
    });
    user = await this.userRepository.save(user);
    user.username = `nw_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.saveOtpOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }
  async sendOtp(method: AuthMethod, username: string, code: string) {
    if (method === AuthMethod.Email) {
      //sendEmail
    } else if (method === AuthMethod.Phone) {
      await this.kavenegarService.sendVerificationSms(username, code);
    }
  }

  async sendOtpOtp(method: OtpAuthMethod, username: string, code: string) {
    if (method === OtpAuthMethod.Email) {
      //sendEmail
    } else if (method === OtpAuthMethod.Phone) {
      await this.kavenegarService.sendVerificationSms(username, code);
    }
  }

  async sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;
    res.cookie(CookieKeys.OTP, token, CookiesOptionsToken());
    res.json({
      message: PublicMessage.SentOtp,
      code,
    });
  }

  async saveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId });
    let existOtp = false;
    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expiresIn = expiresIn;
      otp.method = method;
    } else {
      otp = this.otpRepository.create({
        code,
        expiresIn,
        userId,
        method,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!existOtp) {
      await this.userRepository.update(
        { id: userId },
        {
          otpId: otp.id,
        }
      );
    }
    return otp;
  }

  async saveOtpOtp(userId: number, method: OtpAuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId });
    let existOtp = false;
    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expiresIn = expiresIn;
      otp.method = method;
    } else {
      otp = this.otpRepository.create({
        code,
        expiresIn,
        userId,
        method,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!existOtp) {
      await this.userRepository.update(
        { id: userId },
        {
          otpId: otp.id,
        }
      );
    }
    return otp;
  }

  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.OTP];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);

    const accessToken = this.tokenService.createAccessToken({ userId });

    const refreshToken = this.tokenService.createRefreshToken({
      userId: userId,
    });
    const refreshHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.refreshRepository.insert({
      userId: userId,
      tokenHash: refreshHash,
      expiresAt,
      revokedAt: null,
    });

    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_email: true,
        }
      );
    } else if (otp.method === AuthMethod.Phone) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_phone: true,
        }
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
      refreshToken,
      user: user
        ? { id: user.id, username: user.username, role: user.role }
        : undefined,
    };
  }

  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({ username });
    } else {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }
    return user;
  }

  async checkExistUserOtp(method: OtpAuthMethod, username: string) {
    let user: UserEntity;
    if (method === OtpAuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === OtpAuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }
    return user;
  }

  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }

  async validateUsernameToken(token: string) {
    const payload = this.tokenService.verifyUsernameToken(token);
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }

  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("email format is incorrect");
      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("mobile number incorrect");
      case AuthMethod.Username:
        return username;
      default:
        throw new UnauthorizedException("username data is not valid");
    }
  }

  otpUsernameValidator(method: OtpAuthMethod, username: string) {
    switch (method) {
      case OtpAuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("email format is incorrect");
      case OtpAuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("mobile number incorrect");
      default:
        throw new UnauthorizedException("username data is not valid");
    }
  }

  async googleAuth(userData: GoogleUser) {
    const { email, firstName, lastName } = userData;
    let token: string;
    let user = await this.userRepository.findOneBy({ email });
    if (user) {
      token = this.tokenService.createOtpToken({ userId: user.id });
    } else {
      user = this.userRepository.create({
        email,
        verify_email: true,
        username: email.split("@")["0"] + randomId(),
      });
      user = await this.userRepository.save(user);
      let profile = this.profileRepository.create({
        userId: user.id,
        nick_name: `${firstName} ${lastName}`,
      });
      profile = await this.profileRepository.save(profile);
      user.profileId = profile.id;
      await this.userRepository.save(user);
      token = this.tokenService.createAccessToken({ userId: user.id });
    }
    return {
      token,
    };
  }
}
