"use client";

import { Button } from "@/react/elements/button";
import fetchApi from "@/utilities/fetch";

type Req = TypeofAppApi["/api"]["GET"]["req"];
type Res = TypeofAppApi["/api"]["GET"]["res"];

const Page = () => {
  return (
    <div>
      <Button
        onClick={async ({ unlock }) => {
          const res = await fetchApi.get("/api", {});
          console.log(res);
          unlock();
        }}
      >
        fetch
      </Button>
    </div>
  );
};

export default Page;
