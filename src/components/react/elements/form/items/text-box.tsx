import { useRef, type HTMLAttributes } from "react";
import { $strParse } from "../../../../data-items/string/parse";
import { $strValidations } from "../../../../data-items/string/validation";
import { isEmpty } from "../../../../objects/string";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type TextBoxOptions<D extends DataItem.$str | undefined> = FormItemOptions<D, D extends DataItem.$str ? DataItem.ValueType<D> : string> & {
  length?: number;
  minLength?: number;
  maxLength?: number;
  charType?: DataItem.$str["charType"];
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

export type TextBoxProps<D extends DataItem.$str | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, TextBoxOptions<D>>;

export const TextBox = <D extends DataItem.$str | undefined>({
  length,
  minLength,
  maxLength,
  charType,
  inputMode,
  autoComplete,
  ...props
}: TextBoxProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);

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
    parse: () => $strParse,
    effect: ({ edit, value }) => {
      if (!edit && iref.current) iref.current.value = value ?? "";
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $strValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => iref.current?.focus(),
  });

  const empty = isEmpty(fi.value);

  const clear = () => {
    if (!fi.editable || empty) return;
    fi.clear();
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
          type="text"
          name={empty ? undefined : fi.name}
          placeholder={fi.editable ? fi.placeholder : ""}
          disabled={fi.disabled}
          readOnly={fi.readOnly || fi.form.pending}
          tabIndex={fi.tabIndex}
          defaultValue={fi.value ?? ""}
          maxLength={fi.dataItem.length ?? fi.dataItem.maxLength}
          autoComplete={autoComplete ?? "off"}
          inputMode={inputMode ?? fi.dataItem.inputMode}
          onChange={e => fi.set({ value: e.target.value, edit: true })}
          aria-invalid={fi.airaProps["aria-invalid"]}
        />
        {!fi.hideClearButton && fi.editable &&
          <div
            className="ipt-btn"
            tabIndex={-1}
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
