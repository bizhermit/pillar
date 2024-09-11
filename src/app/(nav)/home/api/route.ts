import { formatDate } from "@/objects/date";
import { apiMethodHandler } from "@/server/next/app-api";

export const GET = apiMethodHandler(async () => {
  return {
    datetime: formatDate(new Date(), "yyyy-MM-dd hh:mm:ss.SSS"),
  };
});