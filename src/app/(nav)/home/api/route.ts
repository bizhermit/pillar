import { DateTime } from "@/objects/datetime";
import { apiMethodHandler } from "@/server/next/app-api";

export const GET = apiMethodHandler(async () => {
  return {
    datetime: new DateTime().setTimezone("Asia/Tokyo").toString(),
  };
});
