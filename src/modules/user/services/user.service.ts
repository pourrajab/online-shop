import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { ProfileDto } from "../dto/profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../entities/profile.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { IUser } from "src/common/types/request";
import { Gender } from "../enum/gender.enum";
import {
  AuthMessage,
  BadRequestMessage,
  ConflictMessage,
  NotFoundMessage,
  PublicMessage,
  ForbiddenMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "../entities/otp.entity";
import { AuthService } from "../../auth/auth.service";
import { TokenService } from "../../auth/tokens.service";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthMethod } from "../../auth/enums/method.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { UserBlockDto } from "../../auth/dto/auth.dto";
import { UserStatus } from "../enum/status.enum";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto, UpdateUserRoleDto } from "../dto/password.dto";
import { Roles } from "src/common/enums/role.enum";
import { AddressEntity } from "../entities/address.entity";
import { Basket } from "src/modules/basket/entity/basket.entity";
import { Order } from "src/modules/order/entity/order.entity";
import { Payment } from "src/modules/payment/entity/payment.entity";
import { SupportTicket } from "src/modules/support/entity/support-ticket.entity";
import { SystemRoles } from "src/modules/role/enums/permission.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(Basket)
    private basketRepository: Repository<Basket>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}
  async changeProfile(profileDto: ProfileDto) {
    const user = this.request.user;
    if (!user) throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id: userId, profileId } = user;

    let profile = await this.profileRepository.findOneBy({ userId });
    const { birthday, gender, nick_name, job, national_code } = profileDto;

    const hasValidBirthday =
      birthday && !isNaN(Date.parse(birthday as unknown as string));

    if (profile) {
      if (nick_name) profile.nick_name = nick_name;
      if (hasValidBirthday) profile.birthday = new Date(birthday);
      if (gender && Object.values(Gender).includes(gender as Gender))
        profile.gender = gender;
      if (job) profile.job = job;
      if (national_code) profile.national_code = national_code;
    } else {
      const safeNickName = nick_name ?? user.username ?? "";
      profile = this.profileRepository.create({
        nick_name: safeNickName,
        birthday: hasValidBirthday ? new Date(birthday) : undefined,
        gender,
        national_code,
        job,
        userId,
      });
    }
    profile = await this.profileRepository.save(profile);
    if (!profileId) {
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id }
      );
    }
    return {
      message: PublicMessage.Updated,
    };
  }
  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [users, count] = await this.userRepository.findAndCount({
      where: {},
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      users,
    };
  }

  async profile() {
    const currentUser = this.request.user;
    if (!currentUser) {
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    }
    const { id } = currentUser;
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile"],
    });
    return user;
  }
  async changeEmail(email: string) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id } = currentUser;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Email);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { new_email: email });
    const otp = await this.authService.saveOtp(id, AuthMethod.Email);
    const token = this.tokenService.createEmailToken({ email });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyEmail(code: string) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id: userId, new_email } = currentUser;
    const token = this.request.cookies?.[CookieKeys.EmailOTP];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== new_email) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Email) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    await this.userRepository.update(
      { id: userId },
      {
        email,
        verify_email: true,
        new_email: null,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }
  async changePhone(phone: string) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id } = currentUser;
    const user = await this.userRepository.findOneBy({ phone });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Phone);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { new_phone: phone });
    const otp = await this.authService.saveOtp(id, AuthMethod.Phone);
    const token = this.tokenService.createPhoneToken({ phone });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyPhone(code: string) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id: userId, new_phone } = currentUser;
    const token = this.request.cookies?.[CookieKeys.PhoneOTP];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== new_phone) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Phone) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    await this.userRepository.update(
      { id: userId },
      {
        phone,
        verify_phone: true,
        new_phone: null,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }
  async changeUsername(username: string) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id } = currentUser;
    const user = await this.userRepository.findOneBy({ username });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Username);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update({ id }, { username });
    return {
      message: PublicMessage.Updated,
    };
  }
  async changePassword(body: ChangePasswordDto) {
    const currentUser = this.request.user;
    if (!currentUser)
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    const { id } = currentUser;
    const user = await this.userRepository.findOneBy({ id });
    if (!user || !user.password)
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    const ok = await bcrypt.compare(body.currentPassword, user.password);
    if (!ok) throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    const hash = await bcrypt.hash(body.newPassword, 12);
    await this.userRepository.update({ id }, { password: hash });
    return { message: PublicMessage.Updated };
  }

  async updateUserRole(body: UpdateUserRoleDto) {
    const { userId, role } = body;
    const currentUser = this.request.user;
    if (!currentUser) {
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    }

    if (!Object.values(SystemRoles).includes(role as SystemRoles)) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);

    const currentUserRole = currentUser.role;

    if (currentUserRole === SystemRoles.SUPERADMIN) {
      await this.userRepository.update({ id: userId }, { role });
      return { message: PublicMessage.Updated };
    }

    if (currentUserRole === SystemRoles.ADMIN) {
      if (role === SystemRoles.SUPERADMIN) {
        throw new ForbiddenException(
          ForbiddenMessage.AdminCannotAssignSuperadminRole
        );
      }
      await this.userRepository.update({ id: userId }, { role });
      return { message: PublicMessage.Updated };
    }

    throw new ForbiddenException(
      ForbiddenMessage.InsufficientPermissionsToAssignRoles
    );
  }
  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new BadRequestException(NotFoundMessage.NotFound);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new BadRequestException(AuthMessage.ExpiredCode);
    if (otp.code !== code) throw new BadRequestException(AuthMessage.TryAgain);
    return otp;
  }

  async blockToggle(blockDto: UserBlockDto) {
    const { userId } = blockDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    let message = PublicMessage.Blocked;
    if (user.status === UserStatus.Blocked) {
      message = PublicMessage.UnBlocked;
      await this.userRepository.update({ id: userId }, { status: null });
    } else {
      await this.userRepository.update(
        { id: userId },
        { status: UserStatus.Blocked }
      );
    }
    return {
      message,
    };
  }

  async getUserAddresses(userId: number) {
    return await this.addressRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
  }

  async getDefaultAddress(userId: number) {
    return await this.addressRepository.findOne({
      where: { userId, is_default: true },
    });
  }

  async getUserStatistics(userId: number) {
    const [
      totalOrders,
      totalPayments,
      totalBasketItems,
      totalSupportTickets,
      totalAddresses,
    ] = await Promise.all([
      this.orderRepository.count({ where: { userId } }),
      this.paymentRepository.count({ where: { userId } }),
      this.basketRepository.count({ where: { userId } }),
      this.supportTicketRepository.count({ where: { userId } }),
      this.addressRepository.count({ where: { userId } }),
    ]);

    const recentOrders = await this.orderRepository.find({
      where: { userId },
      order: { id: "DESC" },
      take: 5,
      relations: ["items"],
    });

    const recentPayments = await this.paymentRepository.find({
      where: { userId },
      order: { id: "DESC" },
      take: 5,
    });

    return {
      totalOrders,
      totalPayments,
      totalBasketItems,
      totalSupportTickets,
      totalAddresses,
      recentOrders,
      recentPayments,
    };
  }
}
