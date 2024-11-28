type DomEvent<K extends keyof HTMLElementEventMap> = {
  key: K;
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any;
};

type SizeProperty =
  | "width"
  | "height"
  | "minWidth"
  | "maxWidth"
  | "minHeight"
  | "maxHeight"
  | "padding"
  | "paddingTop"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "margin"
  | "marginTop"
  | "marginBottom"
  | "marginLeft"
  | "marginRight"
  ;

export class DomElement<E extends HTMLElement> {

  protected events: Array<DomEvent<any>>;
  protected children: Array<DomElement<any>>;

  constructor(public elem: E) {
    this.events = [];
    this.children = [];
  }

  public dispose() {
    this.rmEvent();
    this.children.forEach(c => c.dispose());
    return;
  }

  public addClass(...classNames: Array<string>) {
    this.elem.classList.add(...classNames);
    return this;
  }

  public addEvent<K extends keyof HTMLElementEventMap>(key: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
    this.elem.addEventListener(key, listener, options);
    this.events.push({ key, listener });
    return this;
  }

  public rmEvent(key?: keyof HTMLElementEventMap) {
    if (key) {
      for (let i = this.events.length - 1; i >= 0; i--) {
        const e = this.events[i];
        if (key !== e.key) continue;
        this.elem.removeEventListener(e.key, e.listener);
        this.events.splice(i, 1);
      }
    } else {
      this.events.forEach(e => {
        this.elem.removeEventListener(e.key, e.listener);
      });
      this.events = [];
    }
    return this;
  }

  public addChild(child: DomElement<any>) {
    this.elem.appendChild(child.elem);
    this.children.push(child);
    return this;
  }

  public rmChild(child?: DomElement<any>) {
    if (child == null) {
      this.children.forEach(c => c.dispose());
      this.children = [];
      this.elem.textContent = "";
      return this;
    }
    const i = this.children.findIndex(c => c === child);
    if (i < 0) return this;
    child.dispose();
    this.elem.removeChild(child.elem);
    this.children.splice(i, 1);
    return this;
  }

  public popChild(count: number) {
    for (let i = this.children.length - 1, il = Math.min(Math.max(this.children.length - count - 1, 0), this.children.length - 1); i >= il; i--) {
      const child = this.children[i];
      child.dispose();
      this.elem.removeChild(child.elem);
      this.children.pop();
    }
    return this;
  }

  public setAttr(qualifiedName: string, value?: string) {
    this.elem.setAttribute(qualifiedName, value || "");
    return this;
  }

  public rmAttr(qualifiedName: string) {
    this.elem.removeAttribute(qualifiedName);
    return this;
  }

  public clone(deep?: boolean) {
    return new DomElement<E>(this.elem.cloneNode(deep) as E);
  }

  public isEmpty() {
    return this.children.length === 0;
  }

  public getLength() {
    return this.children.length;
  }

  public scope(func: (dom: this) => void) {
    func(this);
    return this;
  }

  public setStyleSize(key: SizeProperty, size: number | string | null | undefined) {
    if (size == null) {
      this.elem.style.removeProperty(key);
      return this;
    }
    this.elem.style[key] = typeof size === "string" ? size : `${size}px`;
    return this;
  }

}

export const cloneDomElement = <E extends HTMLElement>(baseElem: E) => {
  return new DomElement<E>(baseElem.cloneNode() as E);
};
