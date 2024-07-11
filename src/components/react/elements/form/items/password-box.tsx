import { useRef, useState } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";
import { TextBoxProps } from "./text-box";

type PasswordBoxProps<D extends DataItem.$str | undefined> = TextBoxProps<D> & {
  minimumValidation?: boolean;
  hideToggleButton?: boolean;
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
  ...props
}: PasswordBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);

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
    parse: () => $strParse,
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) iref.current.value = value ?? "";
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $strValidations(minimumValidation ? { type: "str", required: dataItem.required } : dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => iref.current?.focus(),
  });

  const [type, setType] = useState<"text" | "password">("password");
  const empty = isEmpty(fi.value);

  const toggle = () => {
    if (!fi.editable || fi.form.pending) return;
    setType(cur => cur === "text" ? "password" : "text");
  };

  const clear = () => {
    if (!fi.editable || fi.form.pending || empty) return;
    fi.clear(true);
    iref.current?.focus();
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
          type={type}
          name={fi.inputted ? fi.name : undefined}
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          maxLength={minimumValidation ? undefined : (fi.dataItem.length ?? fi.dataItem.maxLength)}
          autoComplete={autoComplete ?? "off"}
          inputMode={fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
          aria-invalid={fi.airaProps["aria-invalid"]}
        />
        {!hideToggleButton && fi.editable &&
          <div
            className="ipt-btn"
            aria-disabled={fi.form.pending}
            onClick={toggle}
          >
            {type === "text" ? "●" : "○"}
          </div>
        }
        {!fi.hideClearButton && fi.editable &&
          <div
            className="ipt-btn"
            aria-disabled={fi.form.pending || empty}
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
