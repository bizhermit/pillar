"use client";

import { isNotEmpty } from "@/objects/string";
import { Dialog } from "@/react/elements/dialog";
import useRouter from "@/react/hooks/router";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode, Suspense } from "react";

type Props = {
  children: ReactNode;
  detail: ReactNode;
};

const Layout = (props: Props) => {
  const router = useRouter();
  const segment = useSelectedLayoutSegment("detail");
  const showDetail = isNotEmpty(segment);

  return (
    <>
      <Suspense>
        {props.children}
      </Suspense>
      <Dialog
        modeless
        open={showDetail}
        onClose={() => {
          if (showDetail) router.back();
        }}
      >
        <div style={{ width: 500, height: 400 }}>
          <Suspense>
            {props.detail}
          </Suspense>
        </div>
      </Dialog>
    </>
  );
};

export default Layout;
