import s from "./page.module.css";

export default function Home() {
  return (
    <div className={s.page}>
      root page

      <button>button</button>
      <button>ボタン</button>
      <a href="https://bizhermit.com">リンク</a>
    </div>
  );
}
