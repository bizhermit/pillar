"use client";

import { useMemo, useRef, type HTMLAttributes, type KeyboardEvent } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { equals } from "../../../../objects";
import { isEmpty, toFullWidth, toFullWidthKatakana, toHalfWidth, toHalfWidthKatakana, toHiragana, toKatakana } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../item-core";

type TextBoxOptions<D extends DataItem.$str | undefined> = FormItemOptions<D, D extends DataItem.$str ? DataItem.ValueType<D> : string> & {
  length?: DataItem.$str["length"];
  minLength?: DataItem.$str["minLength"];
  maxLength?: DataItem.$str["maxLength"];
  charType?: DataItem.$str["charType"];
  inputMode?: DataItem.$str["inputMode"];
  type?: DataItem.$str["inputType"];
  autoComplete?: string;
  placeholder?: string;
};

export type TextBoxProps<D extends DataItem.$str | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TextBoxOptions<D>>;

export const TextBox = <D extends DataItem.$str | undefined>({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  type,
  autoComplete,
  placeholder,
  ...props
}: TextBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => iref.current?.focus();

  const fi = useFormItemCore<DataItem.$str, D, string, string>(props, {
    dataItemDeps: [length, minLength, maxLength, charType],
    getDataItem: ({ dataItem }) => {
      const ct = charType ?? dataItem?.charType;
      return {
        type: "str",
        length: length ?? dataItem?.length,
        minLength: minLength ?? dataItem?.minLength,
        maxLength: maxLength ?? dataItem?.maxLength,
        charType: ct,
        inputMode: inputMode ?? dataItem?.inputMode ?? (() => {
          switch (ct) {
            case "int":
            case "h-num":
              return "numeric";
            case "email":
              return "email";
            case "tel":
              return "tel";
            case "url":
              return "url";
            case "h-alpha":
            case "h-alpha-num":
            case "h-alpha-num-syn":
              return "url";
            default:
              return undefined;
          }
        })(),
        inputType: type || dataItem?.inputType || (() => {
          switch (ct) {
            case "email":
              return "email" as const;
            case "url":
              return "url" as const;
            case "tel":
              return "tel" as const;
            default:
              return "text" as const;
          }
        })(),
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

  const { keydown, blur } = useMemo(() => {
    if (!fi.dataItem.charType) return {};
    const ct = fi.dataItem.charType;
    const funcs: Array<(v: string) => string> = [];

    switch (ct) {
      case "hiragana":
        funcs.push(
          v => toFullWidthKatakana(v),
          v => toHiragana(v),
        );
        break;
      case "katakana":
        funcs.push(v => toKatakana(v));
        break;
      case "f-katakana":
        funcs.push(
          v => toKatakana(v),
          v => toFullWidthKatakana(v),
        );
        break;
      case "h-katakana":
        funcs.push(
          v => toKatakana(v),
          v => toHalfWidthKatakana(v),
        );
        break;
      default:
        if (ct.startsWith("h-") || ct === "half") {
          funcs.push(v => toHalfWidth(v));
        } else if (ct.startsWith("f-") || ct === "full") {
          funcs.push(v => toFullWidth(v));
        }
        break;
    }

    if (funcs.length === 0) return {};
    const convert = () => {
      if (!iref.current) return;
      let v = iref.current.value;
      const buf = v;
      if (!v) return;
      funcs.forEach(f => v = f(v));
      if (!equals(buf, v)) fi.set({ value: v, effect: true });
    };
    return {
      blur: () => convert(),
      keydown: (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") convert();
      }
    };
  }, [fi.dataItem.charType]);

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-field", props.className)}
        data-disabled={fi.disabled}
        data-invalid={fi.iptAria["aria-invalid"]}
      >
        <input
          ref={iref}
          className="ipt-txt"
          type={fi.dataItem.inputType || "text"}
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
          inputMode={fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
          onBlur={blur}
          onKeyDown={keydown}
          {...fi.iptAria}
        />
        {fi.clearButton(empty ? undefined : clear)}
      </div>
      {fi.messageComponent}
    </>
  );
};
