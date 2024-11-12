"use client";

import { isNotEmpty } from "@/objects/string";
import { Dialog } from "@/react/elements/dialog";
import useRouter from "@/react/hooks/router";
import { useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation";
import { ReactNode, Suspense, use } from "react";

type Props = {
  children: ReactNode;
  list: ReactNode;
  detail: ReactNode;
  params: Promise<{ [v: string]: string | Array<string> }>;
};

const Layout = (props: Props) => {
  const segment = useSelectedLayoutSegment();
  const segments = useSelectedLayoutSegments();
  const segmentList = useSelectedLayoutSegment("list");
  const segmentDetail = useSelectedLayoutSegment("detail");
  const params = use(props.params);
  // eslint-disable-next-line no-console
  console.log(segment, segments, segmentList, segmentDetail, params);
  const showDetail = isNotEmpty(segment);
  const dialogDetail = true;

  const router = useRouter();

  return (
    <>
      <span>mode: {showDetail ? "detail" : "list"}</span>
      <br />
      {props.children}
      {props.list}
      {dialogDetail ?
        <Dialog
          open={showDetail}
          onClose={() => {
            if (showDetail) router.back();
          }}
        >
          <div style={{ height: 400, width: 500 }}>
            <Suspense>
              {props.detail}
            </Suspense>
          </div>
        </Dialog> :
        <Suspense>
          {props.detail}
        </Suspense>
      }
    </>
  );
};

export default Layout;
