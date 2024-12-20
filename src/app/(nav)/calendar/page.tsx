import { generateArray } from "@/objects/array";
import { getFirstDateAtMonth, getLastDateAtMonth } from "@/objects/date";
import { CalendarForm, CalendarPageSearchParams, MonthCalendar, WeekCalendar } from "./page-client";

const getCalendar = () => {
  const firstDate = getFirstDateAtMonth(new Date()); // TODO: クライアントタイムゾーン考慮
  const lastDate = getLastDateAtMonth(firstDate);
  const ym = `${lastDate.getFullYear()}-${lastDate.getMonth()}-`;
  return generateArray(lastDate.getDate(), i => {
    return {
      date: `${ym}${i + 1}`,
    };
  });
};

const Page: ServerPage<{ searchParams: CalendarPageSearchParams }> = async (props) => {
  const searchParams = await props.searchParams;

  const range = searchParams.r || "m";

  return (
    <>
      <CalendarForm
        searchParams={searchParams}
      />
      {range === "w" ?
        <WeekCalendar
        />
        :
        <MonthCalendar
        />
      }
    </>
  );
};

export default Page;
