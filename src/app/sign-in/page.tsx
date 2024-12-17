import { redirect } from "@/server/next/navigation";
import { auth } from "~/auth";
import { SignInForm } from "./page-client";

const userHomeUrl: PagePath = "/home";

const Page = async () => {
  const session = await auth();
  if (session?.user != null) {
    redirect(userHomeUrl);
    return null;
  }
  return <SignInForm redirectUrl={userHomeUrl} />;
};

export default Page;
