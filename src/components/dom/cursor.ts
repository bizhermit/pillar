const CURSOR_STYLE_ID = "_cursor";

export const setCursor = (cursor: string) => {
  if (document?.body == null) return () => { };
  document.onselectstart = () => false;
  let elem = document.getElementById(CURSOR_STYLE_ID);
  if (elem == null) {
    elem = document.createElement("style");
    elem.id = CURSOR_STYLE_ID;
    document.head.appendChild(elem);
  }
  elem.textContent = `*,button,a{cursor:${cursor} !important;}`;
  return () => releaseCursor(cursor);
};

export const releaseCursor = (cursor?: string) => {
  document.onselectstart = () => true;
  try {
    const elem = document.getElementById(CURSOR_STYLE_ID);
    if (elem == null) return;
    if (cursor && (elem.textContent || "").indexOf(cursor) < 0) return;
    document.head.removeChild(elem);
  } catch { }
};
