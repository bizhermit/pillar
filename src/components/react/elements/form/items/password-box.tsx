"use client";

import { type FocusEvent, useRef, useState } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { blurToOuter } from "../../../../dom/outer-event";
import { isEmpty } from "../../../../objects/string";
import "../../../../styles/elements/form/item.scss";
import { CircleFillIcon, CircleIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../item-core";
import { type TextBoxProps } from "./text-box";

type PasswordBoxProps<D extends DataItem.$str | undefined> = TextBoxProps<D> & {
  minimumValidation?: boolean;
  hideToggleButton?: boolean;
  placeholder?: string;
};

export const PasswordBox = <D extends DataItem.$str | undefined>({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  autoComplete,
  minimumValidation,
  hideToggleButton,
  placeholder,
  ...props
}: PasswordBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => iref.current?.focus();

  const fi = useFormItemCore<DataItem.$str, D, string, string>(props, {
    dataItemDeps: [length, minLength, maxLength, charType, minimumValidation],
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
            case "h-num":
            case "int":
              return "numeric";
            default:
              return "email";
          }
        })(),
      };
    },
    parse: () => (p) => $strParse(p, true),
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.value = value ?? "";
    },
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $strValidations({ dataItem: minimumValidation ? { type: "str", required: dataItem.required } : dataItem, env });
      return (_, p) => iterator(funcs, p);
    },
    focus: () => iref.current?.focus(),
  });

  const [type, setType] = useState<"text" | "password">("password");
  const empty = isEmpty(fi.value);

  const toggle = () => {
    if (!fi.editable) return;
    setType(cur => cur === "text" ? "password" : "text");
  };

  const clear = () => {
    if (!fi.editable || empty) return;
    fi.clear(true);
    focusInput();
  };

  const blur = (e: FocusEvent<HTMLDivElement>) => {
    if (blurToOuter(e)) setType("password");
    props.onBlur?.(e);
  };

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-field", props.className)}
        onBlur={blur}
        data-disabled={fi.disabled}
        data-invalid={fi.iptAria["aria-invalid"]}
      >
        <input
          ref={iref}
          className="ipt-txt"
          type={type}
          name={fi.mountValue ? fi.name : undefined}
          data-name={fi.name}
          placeholder={fi.editable ? placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly}
          tabIndex={fi.tabIndex}
          autoFocus={fi.autoFocus}
          defaultValue={fi.value ?? ""}
          maxLength={minimumValidation ? undefined : (fi.dataItem.length ?? fi.dataItem.maxLength)}
          autoComplete={autoComplete ?? "off"}
          inputMode={fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
          {...fi.iptAria}
        />
        {!hideToggleButton && fi.showButtons &&
          <button
            className="ipt-btn"
            type="button"
            tabIndex={-1}
            disabled={!fi.editable}
            onClick={toggle}
          >
            {type === "text" ? <CircleFillIcon /> : <CircleIcon />}
          </button>
        }
        {fi.clearButton(empty ? undefined : clear)}
      </div>
      {fi.messageComponent}
    </>
  );
};
