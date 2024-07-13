"use client";

import { ChangeEvent, useRef } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";
import { TextBoxProps } from "./text-box";

type CreditCardNumberBoxProps<D extends DataItem.$str | undefined> = Omit<TextBoxProps<D>, "inputMode">;

export const CreditCardNumberBox = <D extends DataItem.$str | undefined>({
  length,
  minLength,
  maxLength,
  charType,
  autoComplete,
  ...props
}: CreditCardNumberBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => iref.current?.focus();

  const fi = useFormItemCore<DataItem.$str, D, string, string>(props, {
    dataItemDeps: [length, minLength, maxLength, charType],
    getDataItem: ({ dataItem }) => {
      return {
        type: "str",
        length: undefined,
        minLength: minLength ?? dataItem?.minLength ?? 14,
        maxLength: maxLength ?? dataItem?.maxLength ?? 16,
        charType: charType ?? dataItem?.charType ?? "h-num",
      };
    },
    parse: () => $strParse,
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.value = parseFormattedValue(value) ?? "";
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $strValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const empty = isEmpty(fi.value);

  const parseFormattedValue = (v: string | null | undefined) => {
    return (v?.replace(/\s/g, "") ?? "")
      .split("")
      .reduce((ccnumStr, numStr, index) => {
        return ccnumStr + numStr + (0 < index && index < 15 && (index + 1) % 4 === 0 ? " " : "");
      }, "");
  };

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isEmpty(value)) {
      fi.set({ value, edit: true });
      return;
    }
    const revert = () => {
      if (iref.current) iref.current.value = parseFormattedValue(fi.valueRef.current);
    };
    const v = value.replace(/\s/g, "");
    if (!/^[0-9]*$/.test(v)) return revert();
    const buf = String(fi.valueRef.current || "");
    fi.set({ value: v, edit: true });
    if (iref.current) {
      let fv = parseFormattedValue(v);
      if (v.length <= buf.length) fv = fv.trim();
      if (iref.current.value !== fv) {
        iref.current.value = fv;
      }
    }
  };

  const clear = () => {
    if (!fi.editable || empty) return;
    fi.clear(true);
    focusInput();
  };

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-field", props.className)}
      >
        <input
          ref={iref}
          className="ipt-txt"
          type="text"
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          maxLength={19}
          autoComplete={autoComplete ?? "off"}
          inputMode="numeric"
          onChange={change}
          data-invalid={fi.airaProps["data-invalid"]}
        />
        {fi.mountValue &&
          <input
            name={fi.name}
            type="hidden"
            value={empty ? "" : fi.value}
            disabled={fi.disabled}
          />
        }
        {!fi.hideClearButton && fi.showButtons &&
          <div
            className="ipt-btn"
            data-disabled={!fi.editable || empty}
            onClick={clear}
          >
            ×
          </div>
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
