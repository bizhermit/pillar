/* eslint-disable no-console */
"use client";

import { get, set } from "@/objects/struct";
import { Button } from "@/react/elements/button";
import { Dialog, useDialog } from "@/react/elements/dialog";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { useFormItem, useFormValue } from "@/react/elements/form/hooks";
import { CheckBox } from "@/react/elements/form/items/check-box";
import { CheckList } from "@/react/elements/form/items/check-list";
import { CreditCardNumberBox } from "@/react/elements/form/items/credit-card-box";
import { DateBox } from "@/react/elements/form/items/date-box";
import { DateSelectBox } from "@/react/elements/form/items/date-select-box";
import { ElecSign } from "@/react/elements/form/items/elec-sign";
import { FileButton } from "@/react/elements/form/items/file-button";
import { FileDrop } from "@/react/elements/form/items/file-drop";
import { Hidden } from "@/react/elements/form/items/hidden";
import { NumberBox } from "@/react/elements/form/items/number-box";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { RadioButtons } from "@/react/elements/form/items/radio-buttons";
import { SelectBox } from "@/react/elements/form/items/select-box";
import { Slider } from "@/react/elements/form/items/slider";
import { InputTabContainer } from "@/react/elements/form/items/tab-container";
import { TextArea } from "@/react/elements/form/items/text-area";
import { TextBox } from "@/react/elements/form/items/text-box";
import { TimeBox } from "@/react/elements/form/items/time-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import { FormItemRange, FormItemWrap } from "@/react/elements/form/wrap";
import { MagnifyingGlassIcon, SmileIcon } from "@/react/elements/icon";
import { $alert, $confirm } from "@/react/elements/message-box";
import { TabContainer, TabContent, useTabContainer } from "@/react/elements/tab-container";
import { LayoutContext } from "@/react/hooks/layout";
import useRouter from "@/react/hooks/router";
import { sleep } from "@/utilities/sleep";
import { use, useRef, useState } from "react";
import css from "./page.module.css";

export default function Home() {
  const layout = use(LayoutContext);
  const ref = useRef<HTMLButtonElement>(null);
  const [bind, setBind] = useState<{ [v: string]: any }>({
    // text: "123",
    // text: null,
    // text: undefined,
    // select: 309,
    // select: 3,
    "check-list": [1],
    "date-select-m": 3,
    // "hidden": "piyo",
  });
  const formItem = useFormItem();
  const [hiddenValue, setHiddenValue] = useState<any>(undefined);
  const tabCont = useTabContainer();

  const formDisabled = useFormItem();
  const disabled = useFormItem();
  const readOnly = useFormItem();

  const modalDialog = useDialog();
  const modelessDialog = useDialog();

  const router = useRouter();

  return (
    <div>
      {/* <LoadingBar
      // mask
      /> */}
      <TabContainer
        disabled={disabled.value}
        // defaultMount
        // keepMount
        hook={tabCont.hook}
        onChange={(k) => {
          console.log("tab change", k, formItem.value);
        }}
      >
        <TabContent
          key="1"
          label="タブ１"
          className="hogehoge"
        // keepMount
        >
          <h1>tab 1</h1>
          <Button
            onClick={() => {
              tabCont.setKey("2");
            }}
          >
            switch tab 2
          </Button>
        </TabContent>
        <TabContent
          key="2"
          label="タブ２"
        // defaultMount
        >
          <h1>tab 2</h1>
          <Button
            onClick={() => {
              tabCont.setKey("1");
            }}
          >
            switch tab 1
          </Button>
        </TabContent>
      </TabContainer>
      <span>tab: {tabCont.key}</span>
      <div className={css.row}>
        <button disabled>button</button>
        <button>ボタン</button>
        <Button
          onClick={() => {
            const data: { [v: string]: any } = {};
            // const name1 = "hoge";
            // const name2 = "fuga";
            // const name2_ = "fuga";
            // const name1 = "hoge[]";
            // const name2 = "hoge[]";
            // const name2_ = "hoge[1]";
            // const name1 = "hoge.fuga[].piyo";
            // const name2 = "hoge.fuga[].piyo";
            // const name2_ = "hoge.fuga[1].piyo";
            const name1 = "hoge.fuga[].piyo";
            const name2 = "hoge.fuga[].piyo";
            const name2_ = "hoge.fuga.[1].piyo";
            set(data, name1, "value");
            console.log("---------");
            // set(data, "hoge.fuga.[1].pipo", "value2");
            set(data, name2, undefined);
            console.log(data);
            console.log(get(data, name1));
            console.log(get(data, name2_));
          }}
        >
          click
        </Button>
        <a
          // href="https://bizhermit.com"
          aria-disabled
          target="_blank"
        >
          リンク
        </a>
        <a
          href="https://bizhermit.com"
          role="button"
          target="_blank"
          aria-disabled
        >
          リンク
        </a>
        <Button
          ref={ref}
          onClick={() => {
            console.log(ref.current);
          }}
          round
          color="danger"
          outline
        >
          console
        </Button>
        <Button
          onClick={async ({ unlock }) => {
            console.log(bind);
            await sleep(3000);
            unlock();
          }}
          round
          outline
        >
          {/* <ButtonIcon>a</ButtonIcon> */}
          <MagnifyingGlassIcon />
        </Button>
        <Button
          onClick={() => {
            setBind({ num: 6, text: "", slider: 64 });
          }}
          outline
          round
        >
          <SmileIcon />
          <span>reset bind</span>
        </Button>
        <ToggleSwitch
          hook={formDisabled.hook}
        >
          form disabled
        </ToggleSwitch>
        <ToggleSwitch
          hook={disabled.hook}
        >
          item disabled
        </ToggleSwitch>
        <ToggleSwitch
          hook={readOnly.hook}
        >
          item readonly
        </ToggleSwitch>
        <Button
          onClick={() => {
            formItem.setValue("hogehoge", true);
          }}
        >
          set hogehoge
        </Button>
      </div>
      <div style={{ display: "flex", flexFlow: "row", gap: 4 }}>
        <Button
          onClick={() => {
            layout.setTheme("auto");
          }}
        >
          auto
        </Button>
        <Button
          onClick={() => {
            layout.setTheme("light");
          }}
        >
          light theme
        </Button>
        <Button
          onClick={() => {
            layout.setTheme("dark");
          }}
        >
          dark theme
        </Button>
        <Button onClick={() => setHiddenValue("hoge")}>set hidden</Button>
        <Button onClick={() => setHiddenValue(undefined)}>clear hidden</Button>
      </div>
      <div style={{ display: "flex", flexFlow: "row", gap: 4 }}>
        <Button
          onClick={async ({ unlock }) => {
            console.log("alert: start");
            // await msgBox.alert("ALERT");
            // await msgBox.alert("ALERT\nALERT\nALERT");
            await $alert({
              title: "ALERT",
              body: "click OK",
              color: "danger",
            });
            console.log("alert: closed");
            unlock();
          }}
        >
          alert
        </Button>
        <Button
          onClick={async ({ unlock }) => {
            console.log("confirm: start");
            // const ret = await msgBox.confirm("CONFIRM");
            // const ret = await msgBox.confirm("CONFIRM\nCONFIRM\nCONFIRM");
            const ret = await $confirm({
              title: "CONFIRM",
              body: "CONFIRM\nCONFIRM\nCONFIRM",
              color: "secondary",
            });
            console.log("confirm: ", ret);
            unlock();
          }}
        >
          confirm
        </Button>
        <Button
          onClick={async () => {
            await $alert("transition");
            router.push("/sandbox");
          }}
        >
          transition page
        </Button>
        <Button
          onClick={async () => {
            $alert({
              body: "transition (no block)",
            });
            router.push("/sandbox");
          }}
        >
          transition page (no block)
        </Button>
      </div>
      <div style={{ display: "flex", flexFlow: "row", gap: 4 }}>
        <Button>primary</Button>
        <Button outline>primary</Button>
        <Button color="secondary">secondary</Button>
        <Button color="secondary" outline>secondary</Button>
        <Button color="danger">danger</Button>
        <Button color="danger" outline>danger</Button>
        <Button color="subdued">subdued</Button>
        <Button color="subdued" outline>subdued</Button>
      </div>
      <Form
        bind={bind}
        disabled={formDisabled.value}
        // preventEnterSubmit
        onSubmit={async ({ hasError, getFormData, getBindData }) => {
          console.log("--- submit --- error:", hasError);
          console.log("--- form ---");
          const fd = getFormData();
          console.log(Array.from(fd.entries()));
          console.log("--- bind ---");
          console.log(getBindData({
            // appendNotChanged: true,
            // pure: true,
          }));
          console.log("--- bind:pure ---");
          console.log(getBindData({
            pure: true,
          }));
          await sleep(3000);
        }}
      >
        <ObservationFormValue name="slider" value={90} />
        <InputTabContainer
          name="tab"
        >
          <TabContent
            key="tab1"
            label="Tab 1"
          >
            tab1
          </TabContent>
          <TabContent
            key="tab2"
            label="Tab 2"
            default
          >
            tab2
          </TabContent>
        </InputTabContainer>
        <div className={css.row}>
          {/* <div style={{ width: 150 }}> */}
          <FormItemWrap>
            <TextBox
              placeholder="テキスト"
              name="text"
              label="テキスト"
              // defaultValue="hoge"
              required={(p) => {
                // console.log((p.data?.slider ?? 0) > 50);
                return (p.data?.slider ?? 0) > 50;
              }}
              refs={["slider"]}
              disabled={disabled.value}
              readOnly={readOnly.value}
              hook={formItem.hook}
            />
          </FormItemWrap>
          <FormItemWrap>
            <TextBox name="texts.[2]" />
            <TextBox name="texts.[1]" />
            <TextBox name="texts.[0]" />
          </FormItemWrap>
          <Hidden
            name="hidden"
            required
            value={hiddenValue}
            defaultValue="fuga"
          />
          <label>
            <span>Label:</span>
            <FormItemWrap>
              <ToggleSwitch
                label="トグル"
                name="toggle"
                required
                requiredIsTrue
                disabled={disabled.value}
                readOnly={readOnly.value}
              >
                トグル
              </ToggleSwitch>
            </FormItemWrap>
          </label>
          <label>
            <span>Label:</span>
            <FormItemWrap>
              <CheckBox
                label="チェックボックス"
                name="check"
                required
                // requiredIsTrue
                disabled={disabled.value}
                readOnly={readOnly.value}
              >
                チェック
              </CheckBox>
            </FormItemWrap>
          </label>
          <FormItemWrap style={{ width: 150 }}>
            <NumberBox
              label="数値"
              name="num"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
              // float={1}
              // requiredIsNotZero
              defaultValue={3000}
            />
          </FormItemWrap>
          <FormItemWrap>
            <PasswordBox
              label="パスワード"
              name="password"
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap
            style={{
              // width: 400,
              // width: 100,
            }}
          >
            <CreditCardNumberBox
              style={{
                // width: "100%",
                // width: 100,
                // width: 400,
              }}
              label="クレジットカード番号"
              name="credit-card"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap>
            <SelectBox
              label="セレクトボックス"
              name="select"
              placeholder="セレクトボックス"
              required
              defaultValue={4}
              initFocusValue={10}
              source={async () => {
                // await sleep(3000);
                const arr = [];
                for (let i = 0; i < 100; i++) {
                  arr.push({ value: i, label: `item-${i}` });
                }
                return arr;
              }}
              // reloadSourceWhenOpen
              disabled={disabled.value}
              readOnly={readOnly.value}
              tieInNames={[
                { dataName: "label", hiddenName: "select-label" }
              ]}
            />
          </FormItemWrap>
          <select>
            <option value={1}>item 1</option>
            <option value={2}>item 2</option>
            <option value={3}>item 3</option>
          </select>
          <FormItemWrap>
            <Slider
              label="数値"
              name="slider"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
              defaultValue={60}
            />
          </FormItemWrap>
          <FormItemWrap>
            <RadioButtons
              label="ラジオボタン"
              name="radio"
              required
              nullable="unselectable"
              source={async () => {
                // await sleep(3000);
                const arr = [];
                for (let i = 0; i < 3; i++) {
                  arr.push({ value: i, label: `item-${i}` });
                }
                return arr;
              }}
              disabled={disabled.value}
              readOnly={readOnly.value}
              tieInNames={[
                { dataName: "label", hiddenName: "radio-label" }
              ]}
            />
          </FormItemWrap>
          <FormItemWrap>
            <CheckList
              label="チェックリスト"
              name="check-list"
              required
              minLength={2}
              source={async () => {
                // await sleep(3000);
                const arr = [];
                for (let i = 0; i < 3; i++) {
                  arr.push({ value: i, label: `item-${i}` });
                }
                return arr;
              }}
              disabled={disabled.value}
              readOnly={readOnly.value}
              tieInNames={[
                { dataName: "label", hiddenName: "check-list-label" }
              ]}
            />
          </FormItemWrap>
          <input type="date" />
          <FormItemRange
            from={
              <DateBox
                label="From"
                name="date"
                placeholder="年月日"
                required
                disabled={disabled.value}
                readOnly={readOnly.value}
                pair={{
                  name: "date-after",
                  position: "after",
                }}
              />
            }
            to={
              <DateBox
                label="To"
                name="date-after"
                placeholder={["yyyy", "m", "d"]}
                required
                disabled={disabled.value}
                readOnly={readOnly.value}
              />
            }
          />
          <FormItemWrap>
            <DateBox
              type="month"
              label="month"
              name="month"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap>
            <DateSelectBox
              label="日付"
              name="date-select"
              placeholder="年月日"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
              splitDataNames={["date-select-y", "date-select-m", "date-select-d"]}
              allowMissing
            // preventCollectForm
            />
          </FormItemWrap>
          <FormItemWrap>
            <DateSelectBox
              type="month"
              label="年月"
              name="month-select"
              placeholder={["y", "m"]}
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          <FormItemWrap>
            <TimeBox
              name="time"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            // defaultValue={60}
            />
          </FormItemWrap>
          <FormItemWrap>
            <TextArea
              label="テキストエリア"
              name="text-area"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            // resize="horizontal"
            />
          </FormItemWrap>
          <FormItemWrap>
            <FileButton
              name="file"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            >
              ファイルを選択
            </FileButton>
          </FormItemWrap>
          <FormItemWrap>
            <FileDrop
              name="file-drop"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            // hideFileName
            // showAlways
            // preventClick
            // preventDrop
            />
          </FormItemWrap>
          <FormItemWrap>
            <ElecSign
              name="elec-sign"
              required
              disabled={disabled.value}
              readOnly={readOnly.value}
            />
          </FormItemWrap>
          {/* </div> */}
          <div
            style={{
              display: "flex",
              flexFlow: "column nowrap",
              gap: 4,
            }}
          >
            <FormButton type="submit">
              submit
            </FormButton>
            <FormButton type="reset">
              reset
            </FormButton>
          </div>
          <span>{formItem.value}</span>
        </div>
        {/* <DatePicker
          type="month"
          // initValue={new Date()}
          // initValue={new Date(2024, 2, 1)}
          // firstWeek={1}
          minDate={new Date(2024, 2, 1)}
          maxDate={new Date(2024, 8, 30)}
          onSelect={(params) => {
            console.log("datepicker", params);
          }}
          onCancel={() => {
            console.log("datepicker cancel");
          }}
        /> */}
      </Form>
      <div className={css.row}>
        <Button
          onClick={() => {
            modalDialog.open();
          }}
        >
          show modal dialog
        </Button>
        <Dialog
          hook={modalDialog.hook}
          // preventBackdropClose
          // customPosition
          immediatelyMount
          keepMount
          style={{
            // width: 100,
            // height: 100,
            // top: 30,
            // left: 30,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
            }}
          >
            dialog
          </div>
          <Button
            onClick={() => {
              modalDialog.close();
            }}
          >
            close
          </Button>
        </Dialog>
        <Button
          onClick={() => {
            modelessDialog.open();
          }}
        >
          show modeless dialog
        </Button>
        <Dialog
          modeless
          // transparent
          hook={modelessDialog.hook}
          closeWhenScrolled
          // preventBackdropClose
          // customPosition
          // preventEscapeClose
          immediatelyMount
          keepMount
          style={{
            // width: 100,
            // height: 100,
            // top: 30,
            // left: 30,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
            }}
          >
            dialog
          </div>
          <Button
            onClick={() => {
              modelessDialog.close();
            }}
          >
            close
          </Button>
        </Dialog>
        <button popoverTarget="popover" popoverTargetAction="show">popover</button>
        <div popover="manual" id="popover">
          hoge
          <button popoverTarget="popover" popoverTargetAction="hide">close</button>
        </div>
      </div>
    </div>
  );
}

const ObservationFormValue = (props: {
  name: string;
  value: any;
}) => {
  const formValue = useFormValue<number>(props.name);

  return (
    <div>
      <span>
        observe {String(formValue.value)}
      </span>
      <Button
        onClick={() => {
          formValue.setValue(props.value);
        }}
      >
        set value
      </Button>
    </div>
  );
};
