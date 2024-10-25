# コーディング規約

基本思想は[React](https://ja.react.dev/)および[Next](https://nextjs.org/docs)の公式に準拠  
コードフォーマットはESLint（.eslintrc.json）の自動整形とする。

## ファイルのインポートパス

`src/app/`および`src/features/`に属するファイル内でのインポートは、相対パスでの記載とします。  
ただし`src`直下まで遡る場合はエイリアスを使用してください。  
※ 基本的にはVSCodeの自動インポート機能におまかせで良い  
  
`src/app/`ではコンテキスト等のルートに近い場所にコンポーネントファイルがある場合はエイリアスの使用を可としますが、`src/features/`に移動させることを検討してください。  

- `src/components/*` → `@/*`
- `src/features/*` → `~/*`
- `src/app/*` → `$/*` （基本的に使用されない）

## フォルダ構成

| フォルダ          | 説明                               |
| ----------------- | ---------------------------------- |
| `src/components/` | 機能要件を含まないコンポーネント群 |
| `src/features/`   | 機能要件を含むコンポーネント群     |
| `src/app/`        | App Router                         |
| `src/i18n/`       | 国際化用言語定義                   |
| `public/imgs/`    | 画像ファイル                       |
| `prisma/`         | Prisma                             |
| `playwright/`     | Playwright                         |
| `docs/`           | ドキュメント                       |

### 機能要件を含まないコンポーネント群（`src/components/*`）

| フォルダ       | 説明                   |
| -------------- | ---------------------- |
| `/data-items/` | 項目定義               |
| `/dom/`        | DOM操作                |
| `/i18n/`       | 国際化                 |
| `/objects/`    | 基底クラスオブジェクト |
| `/react/`      | Reactコンポーネント    |
| `/server/`     | サーバー処理           |
| `/styles/`     | スタイルシート         |
| `/utilities/`  | その他                 |

※ `src/features/`および`src/app/`からのインポートは禁止

### 機能要件を含む共通コンポーネント群（`src/features/*`）

| フォルダ            | 説明                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/`            | 認証周り                                                                                                                                  |
| `/data-items/`      | 項目定義                                                                                                                                  |
| `/server/`          | サーバーサイドロジック                                                                                                                    |
| `/react/elements/`  | 項目単位コンポーネント                                                                                                                    |
| `/react/templates/` | 画面要素の配置方法等を決めるレイアウトコンポーネント                                                                                      |
| `/react/modules/`   | 項目単位コンポーネント（element）やレイアウトコンポーネント（template）を使用し、チャンク（フォーム等）データ構造に対応したコンポーネント |
| `/utilities/`       | その他                                                                                                                                    |

※ `src/app/`からのインポートは禁止

### App Router（`src/app/*`）

ファイルルーティングはNext.jsの[App Router](https://nextjs.org/docs/app/building-your-application/routing)を参照。

| ファイル             | 説明                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`           | パスルートに対して一意となるサーバー（またはクライアント）コンポーネント                                                                                                                 |
| `page-client.tsx`    | `page.tsx`で使用するクライアントコンポーネント群<br>※ `page.tsx`をクライアントコンポーネントとする場合は不要                                                                             |
| `layout.tsx`         | パスルート間で共有されるサーバー（またはクライアント）コンポーネント                                                                                                                     |
| `layout-client.tsx`  | `layout.tsx`で使用するクライアントコンポーネント群<br>※ `layout.tsx`をクライアントコンポーネントとする場合は不要                                                                         |
| `page.module.scss`   | 同階層に存在する`page.tsx`および`page-client.tsx`で使用するスタイルシート。必要に応じて作成する。<br>使用する際は`page.tsx`で`import css from "./page.module.scss";`と記述する。         |
| `layout.module.scss` | 同階層に存在する`layout.tsx`および`layout-client.tsx`で使用するスタイルシート。必要に応じて作成する。<br>使用する際は`layout.tsx`で`import css from "./layout.module.scss";`と記述する。 |
| `api/**/route.ts`    | WebAPIエンドポイント。必要に応じて作成する。<br/>認証チェックロジックの複雑化を避けるため、認証が必要なエンドポイントはページパス付近に作成する。                                        |

## スタイリング

共通コンポーネントはcssまたはscssファイルを定義し、`src/app/layout.tsx`にインポートする。  
`page(-client).tsx`および`layout(-client).tsx`で個別定義する場合は、[CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)を使用する。
