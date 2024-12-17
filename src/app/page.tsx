import { redirect } from "@/server/next/navigation";

const Page = async () => {
  redirect("/sign-in");
};

export default Page;
