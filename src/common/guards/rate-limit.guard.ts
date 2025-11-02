import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { RateLimitMessage } from "src/common/enums/message.enum";

type Bucket = {
  windowStartMs: number;
  count: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private buckets = new Map<string, Bucket>();
  private readonly windowMs = 60_000; // 1 minute
  private readonly limit = 60; // 60 req/min per IP+route

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip = (
      req.ip ||
      req.connection?.remoteAddress ||
      "unknown"
    ).toString();
    const key = `${ip}:${req.method}:${req.baseUrl || req.originalUrl || req.url}`;

    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStartMs >= this.windowMs) {
      this.buckets.set(key, { windowStartMs: now, count: 1 });
      return true;
    }

    if (bucket.count < this.limit) {
      bucket.count += 1;
      return true;
    }

    throw new HttpException(
      RateLimitMessage.TooManyRequests,
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}
