import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { catchError, lastValueFrom, map } from "rxjs";
import {
  ZarinpalSendRequestData,
  ZarinpalVerifyRequestData,
  ZarinpalSendResponse,
  ZarinpalVerifyResponse,
} from "./types/zarinpal.types";

@Injectable()
export class ZarinpalService {
  constructor(private httpService: HttpService) {}

  async sendRequest(
    data?: ZarinpalSendRequestData
  ): Promise<ZarinpalSendResponse> {
    if (!data) {
      throw new BadRequestException("Data is required");
    }
    const { amount, description, user } = data;
    const options = {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: amount * 10,
      description,
      metadata: {
        email: user?.email ?? "example@gmail.com",
        mobile: user?.mobile ?? "",
      },
      callback_url: "http://localhost:3000/payment/verify",
    };
    const result = await lastValueFrom<{
      data: { authority?: string; code?: number };
    }>(
      this.httpService
        .post(process.env.ZARINPAL_REQUEST_URL, options, {})
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            console.log(err);
            throw new InternalServerErrorException("zarinpal error");
          })
        )
    );
    const { authority, code } = result.data || {};
    if (code == 100 && authority) {
      return {
        code,
        authority,
        gatewayURL: `${process.env.ZARINPAL_GATEWAY_URL}/${authority}`,
      };
    }
    throw new BadRequestException("connection faild in zarinpal");
  }
  async verifyRequest(
    data?: ZarinpalVerifyRequestData
  ): Promise<ZarinpalVerifyResponse> {
    if (!data) {
      throw new BadRequestException("Data is required");
    }
    const option = {
      authority: data.authority,
      amount: data.amount * 10,
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    };
    const result = await lastValueFrom<ZarinpalVerifyResponse>(
      this.httpService
        .post(process.env.ZARINPAL_VERIFY_URL, option, {})
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            console.log(err);
            throw new InternalServerErrorException("zarinpal faild");
          })
        )
    );
    return result;
  }
}
