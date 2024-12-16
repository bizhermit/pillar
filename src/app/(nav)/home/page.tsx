import { auth } from "~/auth";

const Page = async () => {
  const session = await auth();

  return (
    <div>
      <h1>SignedIn</h1>
      <span>{session?.user?.email}</span>
    </div>
  );
};

export default Page;
