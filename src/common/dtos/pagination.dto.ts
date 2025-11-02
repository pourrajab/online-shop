import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @ApiPropertyOptional({ type: "integer", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: "integer", example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
