import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle("Online Shop API")
    .setDescription("E-commerce backend built with NestJS")
    .setVersion("v1.0.0")
    .addBearerAuth(SwaggerAuthConfig(), "Authorization")
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup("/swagger", app, swaggerDocument);
}
function SwaggerAuthConfig(): SecuritySchemeObject {
  return {
    type: "http",
    bearerFormat: "JWT",
    in: "header",
    scheme: "bearer",
  };
}
