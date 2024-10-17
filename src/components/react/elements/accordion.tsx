"use client";

import { langFactory } from "@/i18n/factory";
import { type ReactNode } from "react";
import { type ButtonProps } from "./button";
import { DownIcon, RightIcon } from "./icon";
import { joinClassNames } from "./utilities";

type AccordionOptions = {
  className?: string;
  summary?: ReactNode;
  summaryButton?: Pick<ButtonProps,
    | "color"
    | "outline"
    | "round"
  >;
  defaultOpen?: boolean;
  disabled?: boolean
  children?: ReactNode;
  direction?: "horizontal" | "vertical";
  onToggle?: (open: boolean) => void;
};

const lang = langFactory();

export const Accordion = ({
  className,
  summary,
  summaryButton,
  defaultOpen,
  disabled,
  direction,
  onToggle,
  children,
}: AccordionOptions) => {
  return (
    <>
      <label
        className="accordion-summary"
        tabIndex={disabled ? undefined : 0}
        data-direction={direction}
        onKeyDown={e => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            const elem = e.currentTarget.querySelector(`input[type="checkbox"]`) as HTMLInputElement;
            if (elem) {
              elem.checked = !elem.checked;
              onToggle?.(elem.checked);
            }
          }
        }}
        onClick={e => {
          if (disabled) e.preventDefault();
        }}
        role={summaryButton ? "button" : undefined}
        {...summaryButton ? {
          "data-color": summaryButton.color,
          "data-outline": summaryButton.outline,
          "data-round": summaryButton.round,
          "aria-disabled": disabled,
        } : undefined}
      >
        <input
          type="checkbox"
          className="accordion-check"
          defaultChecked={defaultOpen}
          onChange={(e) => {
            onToggle?.(e.currentTarget.checked);
          }}
        />
        {!summaryButton &&
          <div className="accordion-toggle">
            {direction === "horizontal" ? <RightIcon /> : <DownIcon />}
          </div>
        }
        {summary || lang("common.detail")}
      </label>
      <div
        className={joinClassNames("accordion", className)}
        data-direction={direction}
      >
        <div className="accordion-contents">
          {children}
        </div>
      </div>
    </>
  );
};
