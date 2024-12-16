import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  // eslint-disable-next-line no-console
  console.log("/parallel-routes/hoge layout");
  // eslint-disable-next-line no-console
  console.log(Object.keys(props));
  return (
    <>
      {props.children}
    </>
  );
};

export default Layout;
