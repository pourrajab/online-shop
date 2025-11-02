namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "test" | "production";
    //Application
    PORT: number;
    BACKEND_URL: string;
    FRONTEND_URL: string;
    //Database
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    DB_SYNC?: "true" | "false";
    TYPEORM_LOGGING?: "true" | "false" | "1" | "0";
    //secrets
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    EMAIL_TOKEN_SECRET: string;
    PHONE_TOKEN_SECRET: string;
    //kavenegar
    SEND_SMS_URL: string;
    //google
    GOOGLE_CLIENT_ID: string;
    GOOGLE_SECRET_ID: string;
    //s3
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT: string;

    //Zarinnpal
    ZARINPAL_VERIFY_URL: string;
    ZARINPAL_REQUEST_URL: string;
    ZARINPAL_GATEWAY_URL: string;
    ZARINPAL_MERCHANT_ID: string;
  }
}
