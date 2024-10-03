import { langFactory } from "@/i18n/server";
import Link from "@/react/elements/link";

const Page = () => {
  const lang = langFactory();

  return (
    <>
      <h1>Next App Template</h1>
      <h2>{lang.get("common.halloWorld")}</h2>
      <ul>
        <li>
          <Link href="/sign-in">SignIn</Link>
        </li>
        <li>
          <Link href="/sandbox">sandbox</Link>
        </li>
      </ul>
    </>
  );
};

export default Page;
