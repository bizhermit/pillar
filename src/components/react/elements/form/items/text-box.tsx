import { useRef, type HTMLAttributes } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { useFormItem } from "../hooks";
import { joinClassNames } from "../utilities";

type TextBoxOptions = FormItemOptions<DataItem.$str> & {
  length?: number;
  minLength?: number;
  maxLength?: number;
  charType?: DataItem.$str["charType"];
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

type TextBoxProps = OverwriteAttrs<HTMLDivElement, HTMLAttributes<HTMLDivElement>, TextBoxOptions>;

export const TextBox = ({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  autoComplete,
  ...props
}: TextBoxProps) => {
  const iref = useRef<HTMLInputElement>(null!);

  const fi = useFormItem(props, {
    getDataItem: ({ dataItem }) => {
      return {
        type: "str",
        length: length ?? dataItem?.length,
        minLength: minLength ?? dataItem?.minLength,
        maxLength: maxLength ?? dataItem?.maxLength,
        charType: charType ?? dataItem?.charType,
      };
    },
    dataItemDeps: [length, minLength, maxLength, charType],
    parse: (p) => $strParse(p),
    effect: ({ edit, value }) => {
      if (!edit) iref.current.value = value ?? "";
    },
    validations: ({ dataItem }) => $strValidations(dataItem),
  });

  const clear = () => {
    fi.clear(false);
    iref.current?.focus();
  };

  const empty = isEmpty(fi.value);

  return (
    <>
      <div
        {...fi.props}
        {...fi.airaProps}
        className={joinClassNames("ipt-main", props.className)}
      >
        <input
          ref={iref}
          type="text"
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          maxLength={fi.dataItem.length ?? fi.dataItem.maxLength}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          autoComplete={autoComplete}
          inputMode={inputMode ?? fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
        />
        {!fi.hideClearButton && fi.editable &&
          <button
            className="ipt-btn"
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
