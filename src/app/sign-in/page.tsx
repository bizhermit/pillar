import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "./sign-in-form";

const userHomeUrl: PagePath = "/home";

const Page = async () => {
  const session = await auth();
  if (session?.user != null) {
    return redirect(userHomeUrl);
  }
  return <SignInForm redirectUrl={userHomeUrl} />;
};

export default Page;
