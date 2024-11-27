import { ListView } from "@/react/elements/list-view";
import css from "./page.module.scss";

const Page = () => {
  return (
    <>
      <h1>ListView</h1>
      <div className={css.main}>
        <ListView
        />
      </div>
    </>
  );
};

export default Page;
