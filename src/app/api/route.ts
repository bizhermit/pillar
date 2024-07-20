import { $bool } from "@/data-items/bool";
import { $num } from "@/data-items/number";
import { $str } from "@/data-items/string";
import { apiMethodHandler } from "@/server/next-api-handler/app-api";

export const GET = apiMethodHandler(async (props) => {
  const data = await props.getParams([
    $str({ name: "hoge", required: true }),
    $num({ name: "fuga", required: false }),
    $bool({ name: "piyo", required: true }),
  ]);
  console.log(data);
  props.throwIfHasValidationError();
  return {
    req: data,
  };
});
