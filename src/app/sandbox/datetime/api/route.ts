import { DateTime } from "@/objects/datetime";
import { apiMethodHandler } from "@/server/next/app-api";

export const GET = apiMethodHandler(async () => {
  const dt = new DateTime();
  return {
    datetime: dt.toString(),
    offset: dt.getTimezoneOffset(),
    utc: new DateTime().setTimezone("America/Los_Angeles").setTimezone("UTC").toString(),
    la: new DateTime().setTimezone("America/Los_Angeles").toString(),
  };
});
