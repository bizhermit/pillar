"use client";

import { Button } from "@/react/elements/button";
import fetchApi from "@/utilities/fetch";

type Req = TypeofAppApi["/api"]["GET"]["req"];
type Res = TypeofAppApi["/api"]["GET"]["res"];

// type $Req = Api.Request<"/api", "get">;
// type $Res = Api.Response<"/api", "get">;

const Page = () => {
  return (
    <div>
      <Button
        onClick={async ({ unlock }) => {
          const res = await fetchApi.get("/api");
          console.log(res);
          res.data?.req.fuga;
          if (res.ok) {
            res.data.count;
          }
          unlock();
        }}
      >
        fetch
      </Button>
    </div>
  );
};

export default Page;
