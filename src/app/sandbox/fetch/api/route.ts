import { formatDate } from "@/objects/date";
import { apiMethodHandler } from "@/server/next/app-api";

export const GET = apiMethodHandler(async () => {
  console.log("[api]: /sandbox/fetch/api [GET]");
  return {
    datetime: formatDate(new Date(), "yyyy-MM-dd hh:mm:ss.SSS"),
  };
});

export const POST = apiMethodHandler(async () => {
  console.log("[api]: /sandbox/fetch/api [POST]");
  return {
    datetime: formatDate(new Date(), "yyyy-MM-dd hh:mm:ss.SSS"),
  };
});

