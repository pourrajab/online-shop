import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { KavenegarService } from "./kavenegar.service";
import { ZarinpalService } from "./zarinpal.service";


@Global()
@Module({
    imports: [HttpModule.register({
        timeout: 10000,
    })],
    providers: [KavenegarService ,ZarinpalService],
    exports: [KavenegarService , ZarinpalService],
})
export class CustomHttpModule {}