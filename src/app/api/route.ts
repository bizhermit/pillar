import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";
import { apiMethodHandler } from "@/server/next/app-api";

const GET_ARGS = [
  $str({ name: "hoge", required: true }),
  $num({ name: "fuga", required: false }),
  $bool({ name: "piyo", required: true }),
];

export const GET = apiMethodHandler(async (props) => {
  const data = await props.getParams(GET_ARGS);
  // const data = await props.getParams([
  //   $str({ name: "hoge", required: true }),
  //   $num({ name: "fuga", required: false }),
  //   $bool({ name: "piyo", required: true }),
  // ] as const);
  // eslint-disable-next-line no-console
  console.log(data);
  // data.fuga
  data.fuga;
  props.throwIfHasValidationError();
  // const count = await db.user.count();
  return {
    req: data,
    count: 1 as const,
  };
});
