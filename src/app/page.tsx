/* eslint-disable no-console */
"use client";

import { Button } from "@/react/elements/button";
import { Dialog, useDialog } from "@/react/elements/dialog";
import { Form } from "@/react/elements/form";
import { FormButton } from "@/react/elements/form/form-button";
import { useFormItem } from "@/react/elements/form/hooks";
import { CheckBox } from "@/react/elements/form/items/check-box";
import { CheckList } from "@/react/elements/form/items/check-list";
import { CreditCardNumberBox } from "@/react/elements/form/items/credit-card-box";
import { DateBox } from "@/react/elements/form/items/date-box";
import { DateSelectBox } from "@/react/elements/form/items/date-select-box";
import { ElecSign } from "@/react/elements/form/items/elec-sign";
import { FileButton } from "@/react/elements/form/items/file-button";
import { FileDrop } from "@/react/elements/form/items/file-drop";
import { NumberBox } from "@/react/elements/form/items/number-box";
import { PasswordBox } from "@/react/elements/form/items/password-box";
import { RadioButtons } from "@/react/elements/form/items/radio-buttons";
import { SelectBox } from "@/react/elements/form/items/select-box";
import { Slider } from "@/react/elements/form/items/slider";
import { TextArea } from "@/react/elements/form/items/text-area";
import { TextBox } from "@/react/elements/form/items/text-box";
import { ToggleSwitch } from "@/react/elements/form/items/toggle-switch";
import { FormItemRange, FormItemWrap } from "@/react/elements/form/wrap";
import { MagnifyingGlassIcon, SmileIcon } from "@/react/elements/icon";
import { sleep } from "@/utilities/sleep";
import { useRef, useState } from "react";
import s from "./page.module.css";

export default function Home() {
  const ref = useRef<HTMLButtonElement>(null);
  const [bind, setBind] = useState<{ [v: string]: any }>({
    // text: "123",
    // text: null,
    // text: undefined,
    // select: 309,
    // select: 3,
    "check-list": [1]
  });
  const formItem = useFormItem();

  const formDisabled = useFormItem();
  const disabled = useFormItem();
  const readOnly = useFormItem();

  const dialog = useDialog();

  return (
    <div>
      <div className={s.row}>
        <button disabled>button</button>
        <button>ボタン</button>
        <Button
          onClick={() => {
            const url = "https://www.kansaigaidai.ac.jp/asp/img/pdf/82/7a79c35f7ce0704dec63be82440c8182.pdf";
            // リンクを作成してクリックさせる
            const a = document.createElement("a");
            a.href = url;
            // a.download = "hoge.pdf";
            // a.target = "_blank";
            document.body.appendChild(a); // DOMに追加する必要がある
            a.click(); // クリックイベントを発生させる
            a.addEventListener("click", function () {
              // クリック後に別タブを閉じる
              setTimeout(() => {
                URL.revokeObjectURL(url); // URLを解放する
                document.body.removeChild(a); // リンク要素を削除する
                window.close(); // 別タブを閉じる
              }, 100);
            });
            // ダウンロード後に不要になったら、URLオブジェクトを解放する
            URL.revokeObjectURL(url);
          }}
        >
          download
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
            setBind({});
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
      <div style={{ display: "flex", flexFlow: "row", gap: 4}}>
        <Button>primary</Button>
        <Button outline>primary</Button>
        <Button color="secondary">secondary</Button>
        <Button color="secondary" outline>secondary</Button>
        <Button color="danger">danger</Button>
        <Button color="danger" outline>danger</Button>
      </div>
      <Form
        bind={bind}
        disabled={formDisabled.value}
        // preventEnterSubmit
        onSubmit={async ({ hasError, getFormData, getBindData }) => {
          console.log("--- submit --- error:", hasError);
          console.log("--- form ---");
          const fd = getFormData();
          fd.forEach((v, k) => console.log(k, v));
          console.log("--- bind ---");
          console.log(getBindData({
            // appendNotChanged: true,
          }));
          await sleep(3000);
        }}
      >
        <div className={s.row}>
          {/* <div style={{ width: 150 }}> */}
          <FormItemWrap
          // style={{ width: 100 }}
          >
            <TextBox
              // style={{ width: "100px" }}
              placeholder="テキスト"
              name="text"
              label="テキスト"
              defaultValue="hoge"
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
          <FormItemWrap>
            <CreditCardNumberBox
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
              // minLength={2}
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
      <div className={s.row}>
        <Button
          onClick={() => {
            dialog.open();
          }}
        >
          show modal dialog
        </Button>
        <Button
          onClick={() => {
            dialog.open({ modal: false });
          }}
        >
          show modaless dialog
        </Button>
        <Dialog
          hook={dialog.hook}
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
              dialog.close();
            }}
          >
            close
          </Button>
        </Dialog>
        <span>{dialog.state}</span>
      </div>
    </div>
  );
}
