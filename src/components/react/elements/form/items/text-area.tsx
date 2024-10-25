"use client";

import { type HTMLAttributes, useRef } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TextAreaOptions<D extends DataItem.$str | undefined> = FormItemOptions<D, D extends DataItem.$str ? DataItem.ValueType<D> : string> & {
  length?: DataItem.$str["length"];
  minLength?: DataItem.$str["minLength"];
  maxLength?: DataItem.$str["maxLength"];
  charType?: DataItem.$str["charType"];
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
};

type TextAreaProps<D extends DataItem.$str | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TextAreaOptions<D>>;

export const TextArea = <D extends DataItem.$str | undefined>({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  autoComplete,
  placeholder,
  resize,
  ...props
}: TextAreaProps<D>) => {
  const iref = useRef<HTMLTextAreaElement>(null!);
  const focusInput = () => iref.current?.focus();

  const fi = useFormItemCore<DataItem.$str, D, string, string>(props, {
    dataItemDeps: [length, minLength, maxLength, charType],
    getDataItem: ({ dataItem }) => {
      return {
        type: "str",
        length: length ?? dataItem?.length,
        minLength: minLength ?? dataItem?.minLength,
        maxLength: maxLength ?? dataItem?.maxLength,
        charType: charType ?? dataItem?.charType,
      };
    },
    parse: () => (p) => $strParse(p, true),
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.value = value ?? "";
    },
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $strValidations({ dataItem, env });
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const empty = isEmpty(fi.value);

  const clear = () => {
    if (!fi.editable || empty) return;
    fi.clear(true);
    focusInput();
  };

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-field", props.className)}
        data-disabled={fi.disabled}
        data-invalid={fi.iptAria["aria-invalid"]}
      >
        <textarea
          ref={iref}
          style={{ resize }}
          className="ipt-txt-area"
          name={fi.mountValue ? fi.name : undefined}
          data-name={fi.name}
          placeholder={fi.editable ? placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          autoFocus={fi.autoFocus}
          defaultValue={fi.value ?? ""}
          maxLength={fi.dataItem.length ?? fi.dataItem.maxLength}
          autoComplete={autoComplete ?? "off"}
          inputMode={inputMode ?? fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
          {...fi.iptAria}
        />
        {fi.clearButton(empty ? undefined : clear)}
      </div>
      {fi.messageComponent}
    </>
  );
};
