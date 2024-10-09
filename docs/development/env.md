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

# 設定値

クライアントサイドで使用する場合は、キー名を`NEXT_PUBLIC_`から始まるようにしてください。  
※ `next.config.mjs`の`env`で設定することも可

## 一覧

| キー                                          | 概要                                                             |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [`TZ`](#tz)                                   | サーバーのタイムゾーン                                           |
| [`APP_MODE`](#app_mode)                       | Webアプリケーションの動作モード                                  |
| [`NEXT_PORT`](#next_port)                     | Nextサーバーの起動ポート                                         |
| [`API_URL`](#api_url)                         | サーバーサイドで使用するWebAPIのオリジン                         |
| [`NEXT_PUBLIC_API_URL`](#next_public_api_url) | クライアントサイドまたはサーバーサイドで使用するWebAPIのオリジン |
| [`AUTH_URL`](#auth_url)                       | 認証APIのオリジン                                                |
| [`AUTH_SECRET`](#auth_secret)                 | 認証の暗号化に使用するsecret文字列                               |
| [`POSTGRES_USER`](#postgres_user)             | PostgreSQLの接続ユーザー                                         |
| [`POSTGRES_PASSWORD`](#postgres_password)     | PostgreSQLの接続パスワード                                       |
| [`POSTGRES_DB`](#postgres_db)                 | PostgreSQLの接続スキーマ                                         |
| [`POSTGRES_PORT`](#postgres_port)             | PostgreSQLの接続ポート                                           |

## 各設定

### `TZ`

**サーバーのタイムゾーン**  
PostgreSQLおよびNode.jsの`DateTime`のタイムゾーンとして使用されます。  

設定値

| value        | 説明                                       |
| ------------ | ------------------------------------------ |
| `UTC`        | 協定世界時（コンテナ使用時のデフォルト値） |
| `Asia/Tokyo` | 日本標準時                                 |


### `APP_MODE`

Webアプリケーションの動作モード。  
※ Nextサーバーの起動モードとは異なります。  

設定値

| value  | 説明                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| `prod` | 本番モード（デフォルト値）                                                                           |
| `dev`  | 開発モード<br>デバッグログ等を表示する 。<br>`*.dev.ts`、`*.dev.tsx`の拡張子がビルド対象に含まれる。 |

### `NEXT_PORT`

### `API_URL`

### `NEXT_PUBLIC_API_URL`

### `AUTH_URL`

### `AUTH_SECRET`

### `POSTGRES_USER`

### `POSTGRES_PASSWORD`

### `POSTGRES_DB`

### `POSTGRES_PORT`
