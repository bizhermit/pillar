"use client";

import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { useLang } from "../../../../i18n/react-hook";
import { equals } from "../../../../objects";
import { convertBlobToFile, convertFileToBase64 } from "../../../../objects/file";
import { isEmpty } from "../../../../objects/string";
import { useRefState } from "../../../hooks/ref-state";
import useRender from "../../../hooks/render";
import { ClearAllIcon, CrossIcon, RedoIcon, SaveIcon, UndoIcon } from "../../icon";
import { joinClassNames } from "../../utilities";
import { useFormItemCore } from "../item-core";

type ElecSignOptions<D extends DataItem.$any | undefined> = FormItemOptions<D, D extends DataItem.$any ? DataItem.ValueType<D> : string> & {
  preventAutoSave?: boolean;
  maxHistory?: number;
  width?: number;
  height?: number;
};

type ElecSignProps<D extends DataItem.$any | undefined> = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, ElecSignOptions<D>>;

export const ElecSign = <D extends DataItem.$any | undefined>({
  preventAutoSave,
  maxHistory,
  width,
  height,
  ...props
}: ElecSignProps<D>) => {
  const lang = useLang();
  const href = useRef<HTMLInputElement>(null!);
  const cref = useRef<HTMLCanvasElement>(null!);
  const focusInput = () => cref.current?.focus();

  const render = useRender();
  const [rev, setRev] = useState(-1);
  const hist = useRef<Array<ImageData>>([]);
  const [nullValue, setNullValue, nullValueRef] = useRefState("");

  const get2DCtx = () => {
    return cref.current?.getContext("2d", { willReadFrequently: true })!;
  };

  const fi = useFormItemCore<DataItem.$any, D, string, string>(props, {
    dataItemDeps: [nullValue],
    getDataItem: () => {
      return { type: "any" };
    },
    parse: () => {
      return ({ value, fullName }) => {
        if (value == null || typeof value === "string") return [value];
        if (value instanceof Blob) {
          return [convertFileToBase64(convertBlobToFile(value, "elec-sign"))];
        }
        if (value instanceof File) {
          return [convertFileToBase64(value)];
        }
        return [undefined, { type: "e", code: "parse", fullName, msg: `データの変換に失敗しました。` }];
      };
    },
    equals: (v1, v2) => {
      if (v1 == null && v2 === nullValueRef.current) return true;
      if (v2 == null && v1 === nullValueRef.current) return true;
      return equals(v1, v2);
    },
    effect: ({ edit, value, effect, init }) => {
      if (init) clearHistory();
      if (edit || !effect) return;
      if (isEmpty(value)) {
        clearCanvas();
      } else {
        const canvas = get2DCtx();
        if (canvas == null) return;
        const img = new Image();
        img.src = value;
        img.onload = () => {
          canvas.drawImage(img, 0, 0);
          pushHistory(canvas.getImageData(0, 0, cref.current.width, cref.current.height));
        };
      }
    },
    validation: ({ dataItem, iterator, env }) => {
      const funcs: Array<DataItem.Validation<any, any>> = [
        (p) => {
          if (typeof p.dataItem.required === "function" && !p.dataItem.required(p)) return undefined;
          if (p.value == null || p.value === "" || p.value === nullValueRef.current) {
            return {
              type: "e",
              code: "required",
              fullName: p.fullName,
              msg: env.lang("validation.writeSign", {
                s: p.dataItem.label || env.lang("form.sign"),
              }),
            };
          }
          return undefined;
        },
        ...dataItem.validations ?? [],
      ];
      return (_, p) => iterator(funcs, p);
    },
    focus: focusInput,
  });

  const empty = isEmpty(fi.value) || fi.value === nullValue;

  const canRedo = rev >= 0 && rev < hist.current.length - 1;
  const canUndo = rev > 0;
  const canClearHist = hist.current.length > 1;

  const save = () => {
    if (cref.current == null) return;
    fi.set({ value: cref.current.toDataURL(), edit: true });
  };

  const clearHistory = () => {
    hist.current.splice(0, hist.current.length);
    setRev(-1);
  };

  const popHistory = () => {
    const popLen = hist.current.length - rev - 1;
    if (popLen > 0) {
      hist.current.splice(rev + 1, popLen);
    }
  };

  const pushHistory = (imageData: ImageData) => {
    hist.current.push(imageData);
    if (hist.current.length > Math.max(0, maxHistory ?? 100)) {
      hist.current.splice(0, 1);
    }
    setRev(hist.current.length - 1);
    render();
  };

  const drawStart = (baseX: number, baseY: number, isTouch?: boolean) => {
    if (!fi.editable || cref.current == null) return;
    const canvas = get2DCtx();
    if (canvas == null) return;
    const lineWidth = 2;
    const lineColor = "black";
    canvas.strokeStyle = lineColor;
    canvas.fillStyle = lineColor;
    canvas.lineWidth = lineWidth;
    const rect = cref.current.getBoundingClientRect();
    const posX = rect.left, posY = rect.top;
    let lastX = 0, lastY = 0, curX = baseX - posX, curY = baseY - posY;
    const moveImpl = (x: number, y: number) => {
      lastX = curX;
      lastY = curY;
      curX = x - posX;
      curY = y - posY;
      canvas.beginPath();
      canvas.moveTo(lastX, lastY);
      canvas.lineTo(curX, curY);
      canvas.lineWidth = lineWidth;
      canvas.stroke();
    };
    const endImpl = () => {
      pushHistory(canvas.getImageData(0, 0, cref.current.width, cref.current.height));
      if (!preventAutoSave) save();
    };
    if (isTouch) {
      const move = (e: TouchEvent) => {
        moveImpl(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      };
      const end = (e: TouchEvent) => {
        endImpl();
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
        e.preventDefault();
      };
      window.addEventListener("touchend", end);
      window.addEventListener("touchmove", move);
    } else {
      const move = (e: MouseEvent) => {
        moveImpl(e.clientX, e.clientY);
        e.preventDefault();
      };
      const end = (e: MouseEvent) => {
        endImpl();
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        e.preventDefault();
      };
      window.addEventListener("mouseup", end);
      window.addEventListener("mousemove", move);
    }
    popHistory();
    canvas.beginPath();
    canvas.fillRect(curX - lineWidth / 2, curY - lineWidth / 2, lineWidth, lineWidth);
    canvas.closePath();
    cref.current.focus();
  };

  const mouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawStart(e.clientX, e.clientY);
    e.preventDefault();
  };
  const touchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e.touches[0];
    drawStart(clientX, clientY, true);
    e.preventDefault();
  };

  const clearCanvas = (history?: boolean) => {
    if (cref.current == null) return;
    if (history) clearHistory();
    else popHistory();
    const canvas = get2DCtx();
    if (canvas == null) return;
    canvas.clearRect(0, 0, cref.current.width, cref.current.height);
    pushHistory(canvas.getImageData(0, 0, cref.current.width, cref.current.height));
    if (!preventAutoSave) save();
  };

  const redo = () => {
    if (!canRedo) return;
    const r = Math.min(hist.current.length - 1, rev + 1);
    setRev(r);
    const canvas = get2DCtx();
    canvas.putImageData(hist.current[r], 0, 0);
    if (!preventAutoSave) save();
    return true;
  };

  const undo = () => {
    if (!canUndo) return;
    const r = Math.max(0, rev - 1);
    setRev(r);
    const canvas = get2DCtx();
    canvas.putImageData(hist.current[r], 0, 0);
    if (!preventAutoSave) save();
    return true;
  };

  useEffect(() => {
    setNullValue(cref.current?.toDataURL());
  }, []);

  return (
    <>
      <div
        {...fi.props}
        className={joinClassNames("ipt-elec-sign", props.className)}
      >
        <canvas
          ref={cref}
          className="ipt-canvas"
          data-name={fi.name}
          onMouseDown={mouseDown}
          onTouchStart={touchStart}
          width={width || 500}
          height={height || 200}
          tabIndex={fi.disabled ? undefined : (fi.tabIndex ?? 0)}
          autoFocus={fi.autoFocus}
          {...fi.iptAria}
        />
        {fi.editable &&
          <div className="ipt-elec-sign-btns">
            {preventAutoSave &&
              <button
                className="ipt-btn"
                type="button"
                tabIndex={-1}
                onClick={save}
                disabled={!fi.editable}
                title={lang("common.save")}
              >
                <SaveIcon />
              </button>
            }
            <button
              className="ipt-btn"
              type="button"
              disabled={!fi.editable || !canUndo}
              tabIndex={-1}
              onClick={undo}
              title={lang("form.revert")}
            >
              <UndoIcon />
            </button>
            <button
              className="ipt-btn"
              type="button"
              disabled={!fi.editable || !canRedo}
              tabIndex={-1}
              onClick={redo}
              title={lang("form.progress")}
            >
              <RedoIcon />
            </button>
            <button
              className="ipt-btn"
              type="button"
              disabled={!fi.editable || empty}
              tabIndex={-1}
              onClick={() => clearCanvas()}
              title={lang("form.clear", { s: lang("form.canvas") })}
            >
              <CrossIcon />
            </button>
            <button
              className="ipt-btn"
              type="button"
              tabIndex={-1}
              disabled={!canClearHist}
              onClick={() => clearCanvas(true)}
              title={lang("form.clearCanvasAndHistory")}
            >
              <ClearAllIcon />
            </button>
          </div>
        }
        {fi.mountValue &&
          <input
            ref={href}
            type="hidden"
            name={fi.name}
            value={fi.value || ""}
          />
        }
      </div>
      {fi.messageComponent}
    </>
  );
};
