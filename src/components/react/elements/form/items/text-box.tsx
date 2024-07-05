import { useRef, type HTMLAttributes } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TextBoxOptions<D extends DataItem.$str> = FormItemOptions<D> & {
  length?: number;
  minLength?: number;
  maxLength?: number;
  charType?: DataItem.$str["charType"];
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

type TextBoxProps<D extends DataItem.$str> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TextBoxOptions<D>>;

export const TextBox = <D extends DataItem.$str>({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  autoComplete,
  ...props
}: TextBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);

  const fi = useFormItemCore<DataItem.$str, D>(props, {
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
    parse: (p) => $strParse(p),
    effect: ({ edit, value }) => {
      if (!edit) iref.current.value = value ?? "";
    },
    validations: ({ dataItem }) => $strValidations(dataItem),
    focus: () => iref.current?.focus(),
  });

  const clear = () => {
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
          type="text"
          name={fi.name}
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          maxLength={fi.dataItem.length ?? fi.dataItem.maxLength}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          autoComplete={autoComplete ?? "off"}
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
