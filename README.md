# 環境

- Node.js v22
- TypeScript v5
- React v19
- Next.js v15
- NextAuth.js v5
- Prisma v5
- PostgreSQL v16

# 開発環境構築

Visual Studio Code（VSCode）の使用を前提としています。

1. 任意のフォルダに当リポジトリをクローンする
2. dockerおよびdocker-composeを実行可能状態にする
3. [環境変数](./docs/development/env.md)を設定する
4. [Dev Container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)を起動する

Dev Container初回起動時のみ、PostgreSQLの構築が行われます。  
Dev Container起動時毎に、npmライブラリのインストールおよびPrismaのマイグレーションが自動実行されます。  

# Webアプリケーション起動

| モード     | Fast Refresh<br>(Hot Reload) | Strict Mode |  SSR  | Dynamic Routing |
| ---------- | :--------------------------: | :---------: | :---: | :-------------: |
| develop    |              ○               |      ○      |   ○   |        ○        |
| production |                              |             |   ○   |        ○        |
| static     |                              |             |       |   ※要事前定義   |


## 開発（develop）モード

```bash
npm run dev
```

## 製品（production）モード

```bash
npm run next
``` 

## 静的（static）モード

```bash
npm run export
```

コマンド実行後、[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)を起動する

# [仕様書](./docs/index.md)

