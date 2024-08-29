import Link from "@/react/elements/link";

const Page = () => {
  return (
    <>
      <span>root</span>
      <ul>
        <li>
          <Link href="/sandbox/intercepting-routes/tasks">
            tasks
          </Link>
        </li>
        <li>
          <Link href="/sandbox/intercepting-routes/task/[[...id]]">
            task add
          </Link>
        </li>
      </ul>
    </>
  );
};

export default Page;
