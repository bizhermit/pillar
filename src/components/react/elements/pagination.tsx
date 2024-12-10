"use client";

import { generateArray } from "@/objects/array";
import { useEffect, useMemo, type HTMLAttributes } from "react";
import "../../styles/elements/pagination.scss";
import { useFormItemRef } from "./form/item-ref";
import { SelectBox } from "./form/items/select-box";
import { joinClassNames } from "./utilities";

export type PaginationOptions = {
  name?: string;
  page: number;
  maxPage: number;
  disabled?: boolean;
  linkLength?: number;
  onChange?: (params: { page: number; currentPage: number; }) => void;
};

type PaginationProps = OverwriteAttrs<HTMLAttributes<HTMLDivElement>, PaginationOptions>;

const PAGINATION_LINK_LENGTH = 4;

export const Pagination = ({
  className,
  name,
  page,
  maxPage,
  disabled,
  linkLength,
  onChange,
  ...props
}: PaginationProps) => {
  const n = (name ?? "page") || undefined;
  const p = Math.max(1, page);
  const mp = Math.max(p, maxPage);
  const ml = linkLength ?? PAGINATION_LINK_LENGTH;

  const source = useMemo(() => {
    return generateArray(mp - 1, (i) => {
      const p = i + 2;
      return { value: p, label: p };
    });
  }, [mp]);
  const selector = useFormItemRef<typeof p, typeof source[number]>();

  useEffect(() => {
    selector.setValue(p, false);
  }, [p]);

  return (
    <div
      {...props}
      className={joinClassNames("pagination", className)}
      aria-disabled={disabled}
    >
      <ul className="pagination-before">
        {p !== 1 &&
          <PaginationLink
            page={1}
            disabled={disabled}
            onClick={() => {
              onChange?.({ currentPage: p, page: 1 });
            }}
          />
        }
        {(() => {
          const over = p > ml + 1;
          const base = over ? p - ml + 2 : 2;
          const nodes = generateArray(p - base, (i) => {
            const bp = i + base;
            return (
              <PaginationLink
                key={bp}
                page={bp}
                disabled={disabled}
                onClick={() => {
                  onChange?.({ currentPage: p, page: bp });
                }}
              />
            );
          });
          if (over) {
            nodes.unshift(<PaginationOmit key="omit" />);
          }
          return nodes;
        })()}
      </ul>
      <SelectBox
        className="pagination-selector"
        ref={selector}
        name={n}
        defaultValue={page}
        source={source}
        emptyItem={{ value: 1, label: "1" }}
        preventSourceMemorize
        hideMessage
        hideClearButton
        disabled={disabled}
        readOnly={maxPage === 1}
        textAlign="center"
        preventEditText
        onEdit={(v) => {
          if (v?.value == null) return;
          onChange?.({ currentPage: p, page: v.value });
        }}
        style={{
          width: `${Math.max(String(maxPage).length * 1.8, 3.2) + 3.2}rem`
        }}
      />
      <ul className="pagination-after">
        {(() => {
          const over = mp - p > ml;
          const base = over ? ml - 2 : mp - p - 1;
          const nodes = generateArray(base, (i) => {
            const ap = i + p + 1;
            return (
              <PaginationLink
                key={ap}
                page={ap}
                disabled={disabled}
                onClick={() => {
                  onChange?.({ currentPage: p, page: ap });
                }}
              />
            );
          });
          if (over) nodes.push(<PaginationOmit key="omit" />);
          return nodes;
        })()}
        {p !== mp &&
          <PaginationLink
            page={maxPage}
            disabled={disabled}
            onClick={() => {
              onChange?.({ currentPage: p, page: mp });
            }}
          />
        }
      </ul>
    </div>
  );
};

const PaginationLink = (props: {
  page: number;
  disabled: boolean | undefined;
  onClick: () => void;
}) => {
  return (
    <li className="pagination-link">
      <a
        href="#"
        aria-disabled={props.disabled}
        onClick={e => {
          e.preventDefault();
          if (props.disabled) return;
          props.onClick();
        }}
      >
        {props.page}
      </a>
    </li>
  );
};

const PaginationOmit = () => {
  return <span className="pagination-omit">...</span>;
};
