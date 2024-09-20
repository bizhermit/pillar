"use client";

import { DateTime } from "@/objects/datetime";
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
              defaultValue={dt.toDateString()}
            />
          </FormItemWrap>
          <FormItemWrap>
            <TimeBox
              name="time"
              defaultValue={540}
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
