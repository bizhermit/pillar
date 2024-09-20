"use client";

import { Button } from "@/react/elements/button";
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
            time: 540,
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
