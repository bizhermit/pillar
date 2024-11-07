"use client";

import { useRef, type ChangeEvent, type DragEvent, type HTMLAttributes } from "react";
import { $fileParse } from "../../../../data-items/file/parse";
import { $fileValidations } from "../../../../data-items/file/validation";
import { langFactory } from "../../../../i18n/next-factory";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../hooks";

type FileDropOptions<D extends DataItem.$file | undefined> = FormItemOptions<D, D extends DataItem.$file ? DataItem.ValueType<D> : File> & {
  accept?: DataItem.$file["accept"];
  fileSize?: DataItem.$file["fileSize"];
  fileName?: DataItem.$file["fileName"];
  hideFileName?: boolean;
  preventClick?: boolean;
  showAlways?: boolean;
};

type FileDropProps<D extends DataItem.$file | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, FileDropOptions<D>>;

const lang = langFactory();

export const FileDrop = <D extends DataItem.$file | undefined>({
  accept,
  fileSize,
  fileName,
  hideFileName,
  preventClick,
  showAlways,
  ...props
}: FileDropProps<D>) => {
  const iref = useRef<HTMLInputElement>(null!);
  const focusInput = () => {
    (iref.current.previousElementSibling as HTMLDivElement)?.focus();
  };

  const fi = useFormItemCore<DataItem.$file, D, File, File>(props, {
    dataItemDeps: [accept, fileSize, fileName],
    getDataItem: ({ dataItem }) => {
      return {
        type: "file",
        accept: accept ?? dataItem?.accept,
        fileSize: fileSize ?? dataItem?.fileSize,
        fileName: fileName ?? dataItem?.fileName,
      };
    },
    parse: () => $fileParse,
    effect: ({ edit, value, effect }) => {
      if (iref.current && (!edit || effect)) {
        if (value) {
          const dt = new DataTransfer();
          if (value instanceof File) {
            dt.items.add(value);
            iref.current.value = "";
            iref.current.files = dt.files;
          } else {
            // eslint-disable-next-line no-console
            console.warn(`failed to convert for DataTransfer. no file/blob`);
          }
        } else {
          iref.current.value = "";
          iref.current.files = null;
        }
      }
    },
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $fileValidations({ dataItem, env });
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const empty = fi.value == null;

  const click = () => {
    if (!fi.editable) return;
    iref.current?.click();
  };

  const dragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!fi.editable) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.removeAttribute("data-dragover");
  };

  const dragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!fi.editable) return;
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    e.currentTarget.setAttribute("data-dragover", "");
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    if (!fi.editable) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.removeAttribute("data-dragover");
    fi.set({
      value: e.dataTransfer.files.item(0),
      edit: true,
      effect: true,
    });
  };

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fi.editable) return;
    const file = e.currentTarget.files?.item(0);
    if (fi.form.process !== "nothing" && fileName) {
      fi.form.setValue(fileName, undefined, true);
    }
    fi.set({ value: file, edit: true });
  };

  const clear = () => {
    if (!fi.editable || empty) return;
    if (fi.form.process !== "nothing" && fileName) {
      fi.form.setValue(fileName, undefined, true);
    }
    fi.clear(true);
    focusInput();
  };

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-file-drop", props.className)}
        {...fi.iptAria}
        aria-disabled={fi.disabled}
        aria-readonly={fi.readOnly}
      >
        {(showAlways || empty) &&
          <div
            role="button"
            className="ipt-file-drop-area"
            data-name={fi.name}
            tabIndex={fi.disabled ? undefined : (fi.tabIndex ?? 0)}
            autoFocus={fi.autoFocus}
            data-click={!preventClick}
            onClick={preventClick ? undefined : click}
            onKeyDown={preventClick ? undefined : (e) => {
              if (e.key === " ") click();
            }}
            onDragLeave={dragLeave}
            onDragOver={dragOver}
            onDrop={drop}
          >
            {props.children ?? lang("form.dragAndDropFile")}
          </div>
        }
        <input
          ref={iref}
          className="ipt-file"
          type="file"
          data-name={fi.name}
          name={fi.mountValue ? fi.name : undefined}
          accept={fi.dataItem.accept}
          onChange={change}
        />
        <div className="ipt-row">
          {!hideFileName && !empty &&
            <span className="ipt-file-name">
              {empty ? undefined : (fi.value?.name || ((!fileName || fi.form.bind == null) ? "" : fi.form.bind?.[fileName]))}
            </span>
          }
          {!empty && fi.clearButton(clear)}
        </div>
      </div>
      {fi.messageComponent}
    </>
  );
};
