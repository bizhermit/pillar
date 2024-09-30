import { DateTime } from "@/objects/datetime";
import { apiMethodHandler } from "@/server/next/app-api";

export const GET = apiMethodHandler(async ({ env }) => {
  // eslint-disable-next-line no-console
  console.log("[api]: /sandbox/fetch/api [GET]");
  return {
    datetime: new DateTime().setTimezone("Asia/Tokyo").toString(),
    tzOffset: env.tzOffset,
    serverTzOffset: new Date().getTimezoneOffset(),
  };
});

export const POST = apiMethodHandler(async () => {
  // eslint-disable-next-line no-console
  console.log("[api]: /sandbox/fetch/api [POST]");
  return {
    datetime: new DateTime().setTimezone("Asia/Tokyo").toString(),
  };
});

