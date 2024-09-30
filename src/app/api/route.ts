import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $optional, $required } from "@/data-items/overwrite";
import { $str } from "@/data-items/string";
import { apiMethodHandler } from "@/server/next/app-api";
import { sleep } from "@/utilities/sleep";

const hoge = $str({ name: "hoge", required: true });
const fuga = $num({ name: "fuga", required: false });
const piyo = $bool({ name: "piyo", required: true });

const GET_ARGS = [
  $optional(hoge),
  fuga,
  piyo,
];

export const GET = apiMethodHandler(async (props) => {
  await sleep(2000);
  // const data = await props.getParams(GET_ARGS);
  const data = await props.getParams([
    $optional(hoge),
    $required(fuga),
    piyo,
  ]);
  // eslint-disable-next-line no-console
  console.log(data);
  props.throwIfHasValidationError();
  // const count = await db.user.count();
  return {
    req: data,
    count: -1,
  };
});
