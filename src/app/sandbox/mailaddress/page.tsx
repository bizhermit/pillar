"use client";

import { isMailAddress } from "@/objects/string";
import { useFormItemRef } from "@/react/elements/form/hooks";
import { TextArea } from "@/react/elements/form/items/text-area";
import css from "./page.module.scss";

const Page = () => {
  const texts = useFormItemRef<string>();

  return (
    <div className={css.root}>
      <TextArea
        className={css.texts}
        ref={texts.hook}
      />
      <table className={css.results}>
        <thead>
          <tr>
            <th>string</th>
            <th>result</th>
          </tr>
        </thead>
        <tbody>
          {texts.value?.split(/\r?\n/g).map((v, i) => {
            return (
              <tr key={`${i}__${v}`}>
                <td>{v}</td>
                <td>{isMailAddress(v) ? "" : "NG"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
