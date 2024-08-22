import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  console.log("/parallel-routes/hoge layout");
  console.log(Object.keys(props));
  return (
    <>
      {props.children}
    </>
  );
};

export default Layout;
