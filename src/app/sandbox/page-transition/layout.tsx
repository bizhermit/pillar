import { ReactNode } from "react";

const Layout = (props: { children: ReactNode; }) => {
  return (
    <>
      <h2>Page Transitions</h2>
      {props.children}
    </>
  );
};

export default Layout;
