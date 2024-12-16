# コーディング規約

基本思想は[React](https://ja.react.dev/)および[Next](https://nextjs.org/docs)の公式に準拠  
コードフォーマットはESLint（.eslintrc.json）の自動整形とする。

## ファイルのインポートパス

`src/app/`および`src/features/`に属するファイル内でのインポートは、相対パスでの記載とする。  
ただし`src`直下まで遡る場合はエイリアスを使用する。  
※ 基本的にはVSCodeの自動インポート機能におまかせで良い  
  
`src/app/`ではコンテキスト等のルートに近い場所にコンポーネントファイルがある場合はエイリアスの使用を可とするが、`src/features/`に移動させることを検討する。  

- `src/components/*` → `@/*`
- `src/features/*` → `~/*`
- `src/app/*` → `$/*` （基本的に使用されない）

## フォルダ構成

| フォルダ          | 説明                               |
| ----------------- | ---------------------------------- |
| `src/components/` | 機能要件を含まないコンポーネント群 |
| `src/features/`   | 機能要件を含むコンポーネント群     |
| `src/app/`        | Next.js App Router                 |
| `src/i18n/`       | 国際化用言語定義                   |
| `public/imgs/`    | 画像ファイル                       |
| `prisma/`         | Prisma定義ファイル群               |
| `playwright/`     | Playwrightコードファイル群         |
| `docs/`           | ドキュメント                       |

### 機能要件を含まない汎用コンポーネント群（`src/components/*`）

| フォルダ       | 説明                   |
| -------------- | ---------------------- |
| `/data-items/` | 項目定義コアモジュール |
| `/dom/`        | DOM操作関連            |
| `/i18n/`       | 国際化コアモジュール   |
| `/objects/`    | 基底クラスオブジェクト |
| `/react/`      | Reactコンポーネント    |
| `/server/`     | サーバー処理           |
| `/styles/`     | スタイルシート         |
| `/utilities/`  | その他                 |

※ `src/features/*`および`src/app/*`からのインポートは禁止

### 機能要件を含む汎用／共通コンポーネント群（`src/features/*`）

| フォルダ            | 説明                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/`            | 認証周り                                                                                                                                  |
| `/data-items/`      | 項目定義                                                                                                                                  |
| `/server/`          | サーバーサイドロジック                                                                                                                    |
| `/react/elements/`  | 項目単位コンポーネント                                                                                                                    |
| `/react/templates/` | 画面要素の配置方法等を決めるレイアウトコンポーネント                                                                                      |
| `/react/modules/`   | 項目単位コンポーネント（element）やレイアウトコンポーネント（template）を使用し、チャンク（フォーム等）データ構造に対応したコンポーネント |
| `/utilities/`       | その他                                                                                                                                    |

※ `src/app/*`からのインポートは禁止

### Next.js App Router（`src/app/*`）

ファイルルーティングはNext.jsの[App Router](https://nextjs.org/docs/app/building-your-application/routing)を参照。

| ファイル             | 説明                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`           | パスルートに対して一意となるサーバー（またはクライアント）コンポーネント                                                                                                                 |
| `page-client.tsx`    | `page.tsx`で使用するクライアントコンポーネント群<br>※ `page.tsx`をクライアントコンポーネントとする場合、およびクライアントコンポーネント不要の場合は作成しない                           |
| `layout.tsx`         | パスルート間で共有されるサーバー（またはクライアント）コンポーネント                                                                                                                     |
| `layout-client.tsx`  | `layout.tsx`で使用するクライアントコンポーネント群<br>※ `layout.tsx`をクライアントコンポーネントとする場合、およびクライアントコンポーネント不要の場合は作成しない                       |
| `page.module.scss`   | 同階層に存在する`page.tsx`および`page-client.tsx`で使用するスタイルシート。必要に応じて作成する。<br>使用する際は該当ファイルで`import css from "./page.module.scss";`と記述する。       |
| `layout.module.scss` | 同階層に存在する`layout.tsx`および`layout-client.tsx`で使用するスタイルシート。必要に応じて作成する。<br>使用する際は該当ファイルで`import css from "./layout.module.scss";`と記述する。 |
| `route.ts`           | WebAPIエンドポイント。必要に応じて作成する。<br/>認証チェックロジックの複雑化を避けるため、認証が必要なエンドポイントはページパス付近に作成する。                                        |

## スタイリング

### グローバル／ユーティリティ

cssまたはscssファイルを作成し、`src/components/styles/index.scss`内でフォワード（インポート順固定）または`src/app.layout.tsx`にインポートする。  
※ 抽象化や共通化が難しい場合は、[Tailwind CSS](https://tailwindcss.com/)の導入も検討

### 汎用／共通コンポーネント

cssまたはscssファイルを定義し、使用するコンポーネント内でインポートする。  
※ クラス名は衝突する可能性を考慮し、プレフィックス（`btn`,`ipt`,`msgbox`等）を使用する

### ページ（レイアウト）コンポーネント

`page(-client).tsx`および`layout(-client).tsx`で個別定義する場合は、[CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)を使用する。  
  
各クラス名はTypeScriptで参照するため、キャメルケースで定義する。
※ クラス名が衝突する可能性は考慮しなくて良いため、`main`や`wrap`等の抽象的な命名で良い
