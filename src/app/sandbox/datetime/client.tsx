"use client";

import { DateTime } from "@/objects/datetime";
import { parseMilliseconds, Time } from "@/objects/time";
import { Button } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { DateBox } from "@/react/elements/form/items/date-box";
import { TimeBox } from "@/react/elements/form/items/time-box";
import { FormItemRow, FormItemWrap } from "@/react/elements/form/wrap";
import { useFetch } from "@/react/hooks/fetch";
import { useEffect, useState } from "react";
import { DateTimeList } from "./components";

export const DatetimeFetchButton = () => {
  const api = useFetch();
  const dt = new DateTime();
  const [datetime, setDatetime] = useState("");
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      dt.toTimeString(),
      parseMilliseconds(dt.toTimeString()),
      new Time(dt.toTimeString()).getMinutes(true)
    );
    setDatetime(dt.toTimeString());
  }, []);

  return (
    <div>
      <Button
        onClick={() => {
          api.get("/sandbox/datetime/api", {
            date: "2024-09-12",
            time: 720,
          }, {
            done: (res) => {
              // eslint-disable-next-line no-console
              console.log(res.data);
            },
          });
        }}
      >
        fetch
      </Button>
      <span>{datetime}</span>
      <Form
        onSubmit={async ({ getFormData }) => {
          const res = await api.get("/sandbox/datetime/api", getFormData());
          // eslint-disable-next-line no-console
          console.log(res.data);
        }}
      >
        <FormItemRow>
          <FormItemWrap>
            <DateBox
              name="date"
              defaultValue={dt}
            />
          </FormItemWrap>
          <FormItemWrap>
            <TimeBox
              name="time"
              defaultValue={dt}
            />
          </FormItemWrap>
        </FormItemRow>
        <FormItemRow>
          <FormButton type="submit">submit</FormButton>
          <FormButton type="reset">reset</FormButton>
        </FormItemRow>
      </Form>
    </div>
  );
};

export const DatetimeListAsClient = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  });

  return ready ? <DateTimeList /> : null;
};
