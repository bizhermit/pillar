import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  default: ReactNode;
  default_page: ReactNode;
  page_default: ReactNode;
  page_page: ReactNode;
};

const Layout = (props: Props) => {
  console.log("/parallel-routes layout");
  console.log(Object.keys(props));
  return (
    <>
      {props.children}
      {props.default_page}
      {props.default}
      {props.page_default}
      {props.page_page}
    </>
  );
};

export default Layout;
