import Link from "@/react/elements/link";
import css from "./error.module.scss";

const NotFound = () => {
  return (
    <main className={css.main}>
      <h1>404&nbsp;|&nbsp;Not&nbsp;Found</h1>
      <Link href="/">Return Top</Link>
    </main>
  );
};

export default NotFound;
