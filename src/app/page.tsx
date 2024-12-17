import { redirect } from "@/server/next/navigation";

const Page = async () => {
  redirect("/sign-in");
  return null;
};

export default Page;
