import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";
import { apiMethodHandler } from "@/server/next/app-api";
import db from "@/server/prisma";

const dataItems = [
  $str({ name: "hoge", required: true }),
  $num({ name: "fuga", required: false }),
  $bool({ name: "piyo", required: true }),
];

export const GET = apiMethodHandler(async (props) => {
  const data = await props.getParams(dataItems);
  // eslint-disable-next-line no-console
  console.log(data);
  props.throwIfHasValidationError();
  const count = await db.user.count();
  return {
    req: data,
    count,
  };
});
