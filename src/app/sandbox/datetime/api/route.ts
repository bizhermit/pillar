import { $date } from "@/data-items/date";
import { $datetime } from "@/data-items/datetime";
import { $time } from "@/data-items/time";
import { DateTime } from "@/objects/datetime";
import { apiMethodHandler } from "@/server/next/app-api";

const datetime = $datetime({
  name: "datetime",
  date: $date({
    name: "date",
  }),
  time: $time({
    name: "time",
  }),
});

export const GET = apiMethodHandler(async ({ getParams }) => {
  const data = await getParams([
    datetime,
  ]);
  const retData = {
    datetime: data.datetime?.toString(),
  };
  // eslint-disable-next-line no-console
  console.log(retData);

  const dt = new DateTime();
  return {
    datetime: dt.toString(),
    offset: dt.getTimezoneOffset(),
    utc: new DateTime().setTimezone("America/Los_Angeles").setTimezone("UTC").toString(),
    la: new DateTime().setTimezone("America/Los_Angeles").toString(),
    args: retData,
  };
});
