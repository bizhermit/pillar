import { langFactory } from "@/i18n/next-factory";
import Link from "@/react/elements/link";

const Page = async () => {
  const lang = await langFactory();

  return (
    <>
      <h1>Node WebApp Template</h1>
      <h2>{lang("common.halloWorld")}</h2>
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
