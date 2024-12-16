# 環境変数

## 動作仕様

| 優先順位 | ファイル名             | 概要                             | develop | production | static |
| :------: | ---------------------- | -------------------------------- | :-----: | :--------: | :----: |
|    1     | .env.production.local  | 製品モード起動時のローカル値     |         |     ○      |   ○    |
|    1     | .env.development.local | 開発モード起動時のローカル値     |    ○    |            |        |
|    2     | .env.local             | 起動モードに非依存なローカル値   |    ○    |     ○      |   ○    |
|    3     | .env.production        | 製品モード起動時のデフォルト値   |         |     ○      |   ○    |
|    3     | .env.development       | 開発モード起動時のデフォルト値   |    ○    |            |        |
|    4     | .env                   | 起動モードに非依存なデフォルト値 |    ○    |     ○      |   ○    |

ファイル名に`.local`が付いていないファイルがgit管理対象となります。  
各環境で値を変更する場合は、`.env*.local`を作成してください。  

## 設定値

クライアントサイドで使用する場合は、キー名を`NEXT_PUBLIC_`から始まるようにしてください。  
※ `next.config.mjs`の`env`で設定することも可

| キー                                        | 概要                                                             |
| ------------------------------------------- | ---------------------------------------------------------------- |
| [`TZ`](#tz)                                 | サーバーのタイムゾーン                                           |
| [`APP_MODE`](#app_mode)                     | Webアプリケーションの動作モード                                  |
| [`FRONTEND_PORT`](#FRONTEND_PORT)           | フロントエンドサーバーの起動ポート                               |
| [`API_URL`](#api_url)                       | サーバーサイドで使用するWebAPIのオリジン                         |
| [`API_URL_IN_CLIENT`](#next_public_api_url) | クライアントサイドまたはサーバーサイドで使用するWebAPIのオリジン |
| [`AUTH_URL`](#auth_url)                     | 認証APIのオリジン                                                |
| [`AUTH_SECRET`](#auth_secret)               | 認証の暗号化に使用するsecret文字列                               |
| [`POSTGRES_USER`](#postgres_user)           | PostgreSQLの接続ユーザー                                         |
| [`POSTGRES_PASSWORD`](#postgres_password)   | PostgreSQLの接続パスワード                                       |
| [`POSTGRES_DB`](#postgres_db)               | PostgreSQLの接続スキーマ                                         |
| [`POSTGRES_PORT`](#postgres_port)           | PostgreSQLの接続ポート                                           |

### `TZ` : サーバーのタイムゾーン  

PostgreSQLおよびNode.jsの`DateTime`のタイムゾーンとして使用されます。  

設定値

| value        | 説明                                       |
| ------------ | ------------------------------------------ |
| `UTC`        | 協定世界時（コンテナ使用時のデフォルト値） |
| `Asia/Tokyo` | 日本標準時                                 |


### `APP_MODE` : Webアプリケーションの動作モード

Nextサーバーの起動モードとは異なります。  

設定値

| value  | 説明                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| `prod` | 本番モード（デフォルト値）                                                                                       |
| `dev`  | 開発モード<br>デバッグログ等を表示する 。                                                                        |
| `mock` | モックモード<br>`*.mock.ts`、`*.mock.tsx`の拡張子がビルド対象に含まれる。 <br>※ ダミーデータを返すWebAPI等に使用 |

### `FRONTEND_PORT` : フロントエンドサーバーの起動ポート

### `API_URL` : サーバーサイドで使用するWebAPIのオリジン

### `API_URL_IN_CLIENT` : クライアントサイドまたはサーバーサイドで使用するWebAPIのオリジン

### `AUTH_URL` : 認証APIのオリジン

### `AUTH_SECRET` : 認証の暗号化に使用するsecret文字列

### `POSTGRES_USER` : PostgreSQLの接続ユーザー

### `POSTGRES_PASSWORD` : PostgreSQLの接続パスワード

### `POSTGRES_DB` : PostgreSQLの接続スキーマ

### `POSTGRES_PORT` : PostgreSQLの接続ポート
