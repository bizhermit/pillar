import { $strValidations } from "../../../../data-items/string/validation";
import { TabContainer, TabContainerProps, useTabContainer } from "../../tab-container";
import { useFormItemCore } from "../hooks";

type FormTabContainerOptions = Pick<FormItemOptions<undefined, string>,
  | "name"
  | "readOnly"
  | "label"
  | "hook"
  | "onChange"
>;

type FormTabContainerProps = OverwriteProps<Omit<TabContainerProps, "hook">, FormTabContainerOptions>;

export const FormTabContainer = ({
  name,
  readOnly,
  label,
  hook,
  onChange,
  defaultKey,
  disabled,
  children,
  ...props
}: FormTabContainerProps) => {
  const $hook = useTabContainer();
  const $children = Array.isArray(children) ? children : [children];

  const defaultValue = (() => {
    if (defaultKey) {
      if ($children.find(c => c.key === defaultKey)) return defaultKey;
    }
    const c = $children.findIndex(c => c.props.default);
    if (c < 0) return $children[0].key!;
    return $children[c].key!;
  })();

  const fi = useFormItemCore<DataItem.$str, undefined, string, string>({
    name,
    hook,
    readOnly,
    onChange,
    label,
    disabled,
    defaultValue,
  }, {
    dataItemDeps: [],
    getDataItem: () => {
      return {
        type: "str",
      };
    },
    parse: () => (p) => {
      const key = String(p.value);
      if ($children.find(c => c.key === key)) return [key];
      return [defaultKey, {
        type: "e",
        code: "parse",
        fullName: p.fullName,
        msg: "一致するキーが存在しません。",
      }];
    },
    effect: ({ value, effect }) => {
      if (effect) $hook.setKey(value!);
    },
    validation: ({ dataItem, iterator }) => {
      const funcs = $strValidations(dataItem);
      return (_, p) => iterator(funcs, p);
    },
    focus: () => { },
  });

  return (
    <>
      <TabContainer
        {...props}
        disabled={fi.disabled || fi.readOnly}
        defaultKey={defaultValue}
        hook={$hook.hook}
        onChange={(k) => {
          fi.set({ value: k });
        }}
      >
        {children}
      </TabContainer>
      {name && fi.mountValue &&
        <input
          type="hidden"
          name={name}
          value={$hook.key ?? ""}
        />
      }
    </>
  );
};
