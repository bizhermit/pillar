"use client";

import { Button } from "@/react/elements/button";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { DateBox } from "@/react/elements/form/items/date-box";
import { TimeBox } from "@/react/elements/form/items/time-box";
import { FormItemWrap } from "@/react/elements/form/wrap";
import { useFetch } from "@/react/hooks/fetch";
import { useEffect, useState } from "react";
import { DateTimeList } from "./components";

export const DatetimeFetchButton = () => {
  const api = useFetch();

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
        <FormItemWrap>
          <DateBox name="date" />
        </FormItemWrap>
        <FormItemWrap>
          <TimeBox name="time" />
        </FormItemWrap>
        <FormButton type="submit">submit</FormButton>
        <FormButton type="reset">reset</FormButton>
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
