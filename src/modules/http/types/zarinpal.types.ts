export interface ZarinpalSendRequestData {
  amount: number;
  description: string;
  user?: {
    email?: string;
    mobile?: string;
  };
}

export interface ZarinpalVerifyRequestData {
  authority: string;
  amount: number;
}

export interface ZarinpalSendResponse {
  code: number;
  authority: string;
  gatewayURL: string;
}

export interface ZarinpalVerifyResponse {
  data?: {
    code: number;
    ref_id?: number;
  };
  errors?: {
    code: number;
    message: string;
  };
}

