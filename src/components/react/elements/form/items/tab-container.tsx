import { $strValidations } from "../../../../data-items/string/validation";
import { getDefaultTabKey, TabContainer, type TabContainerProps, useTabContainer } from "../../tab-container";
import { useFormItemCore } from "../hooks";

type InputTabContainerOptions = Pick<FormItemOptions<undefined, string>,
  | "name"
  | "readOnly"
  | "label"
  | "hook"
  | "onChange"
>;

type InputTabContainerProps = OverwriteProps<Omit<TabContainerProps, "hook">, InputTabContainerOptions>;

export const InputTabContainer = ({
  name,
  readOnly,
  label,
  hook,
  onChange,
  defaultKey,
  disabled,
  children,
  ...props
}: InputTabContainerProps) => {
  const $hook = useTabContainer();
  const $children = Array.isArray(children) ? children : [children];

  const defaultValue = getDefaultTabKey($children, defaultKey);

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
    parse: ({ env }) => (p) => {
      const key = String(p.value);
      if ($children.find(c => c.key === key)) return [key];
      return [defaultKey, {
        type: "e",
        code: "parse",
        fullName: p.fullName,
        msg: env.lang("validation.choices", { value: key }),
      }];
    },
    effect: ({ value, effect }) => {
      if (effect) $hook.setKey(value!);
    },
    validation: ({ dataItem, env, iterator }) => {
      const funcs = $strValidations({ dataItem, env });
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
