import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterNews() {
  return applyDecorators(
    ApiQuery({ name: "category", required: false }),
    ApiQuery({ name: "search", required: false }),
    ApiQuery({ name: "authorId", required: false, type: Number }),
    ApiQuery({ name: "from", required: false, description: "ISO date" }),
    ApiQuery({ name: "to", required: false, description: "ISO date" })
  );
}
