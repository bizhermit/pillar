"use client";

import { formatDate } from "@/objects/date";
import { Form, useFormRef } from "@/react/elements/form";
import { DateSelectBox } from "@/react/elements/form/items/date-select-box";
import { SelectBox } from "@/react/elements/form/items/select-box";
import css from "./page.module.scss";

export type CalendarPageSearchParams = {
  d: `${number}-${number}-${number}`;
  r: "m" | "w";
};

type CalendarFormProps = {
  searchParams: CalendarPageSearchParams;
};

export const CalendarForm = ({ searchParams }: CalendarFormProps) => {
  const formRef = useFormRef();

  const change = () => {
    setTimeout(() => {
      formRef.submit();
    }, 0);
  };

  return (
    <Form
      className={css.form}
      ref={formRef}
      method="get"
    >
      <DateSelectBox
        name="d"
        type="month"
        defaultValue={searchParams.d || formatDate(new Date(), "yyyy-MM")}
        onEdit={change}
      />
      <SelectBox
        textAlign="center"
        name="r"
        source={[
          { value: "m", label: "月" },
          { value: "w", label: "週" },
        ]}
        defaultValue={searchParams.r || "m"}
        preventEditText
        hideClearButton
        onEdit={change}
      />
    </Form>
  );
};

export const MonthCalendar = () => {
  return (
    <>
      month calendar
    </>
  );
};

export const WeekCalendar = () => {
  return (
    <>
      week calendar
    </>
  );
};
