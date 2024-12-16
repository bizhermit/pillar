export const blurToOuter = (e: Pick<FocusEvent, "currentTarget" | "relatedTarget">) => {
  let elem: HTMLElement | null = e.relatedTarget as HTMLElement;
  while (elem) {
    if (elem === e.currentTarget) return false;
    elem = elem.parentElement;
  }
  return true;
};
