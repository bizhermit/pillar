import Link from "@/react/elements/link";

const Page = () => {
  return (
    <>
      <h1>Next App Template</h1>
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
