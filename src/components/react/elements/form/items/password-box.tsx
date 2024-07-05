import { useRef, useState } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";
import { TextBoxProps } from "./text-box";

type PasswordBoxProps<D extends DataItem.$str> = TextBoxProps<D> & {
  minimumValidation?: boolean;
  hideToggleButton?: boolean;
}

export const PasswordBox = <D extends DataItem.$str>({
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

  const fi = useFormItemCore<DataItem.$str, D>(props, {
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
    parse: (p) => $strParse(p),
    effect: ({ edit, value }) => {
      if (!edit && iref.current) iref.current.value = value ?? "";
    },
    validations: ({ dataItem }) => $strValidations(minimumValidation ? { type: "str", required: dataItem.required } : dataItem),
    focus: () => iref.current?.focus(),
  });

  const [type, setType] = useState<"text" | "password">("password");

  const toggle = () => {
    if (!fi.editable) return;
    setType(cur => cur === "text" ? "password" : "text");
  };

  const clear = () => {
    if (!fi.editable) return;
    fi.clear();
    iref.current?.focus();
  };

  const empty = isEmpty(fi.value);

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
          name={empty ? undefined : fi.name}
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          autoComplete={autoComplete ?? "off"}
          inputMode={fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
        />
        {!hideToggleButton && fi.editable &&
          <button
            className="ipt-btn"
            type="button"
            tabIndex={-1}
            disabled={fi.form.pending || empty}
            onClick={toggle}
          >
            {type === "text" ? "●" : "○"}
          </button>
        }
        {!fi.hideClearButton && fi.editable &&
          <button
            className="ipt-btn"
            type="button"
            tabIndex={-1}
            disabled={fi.form.pending || empty}
            onClick={clear}
          >
            ×
          </button>
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
