# その他

## ローカルで自動生成されるルーティング型定義ファイルの変更を無視

```bash
git update-index --skip-worktree src/types/route.d.mts
```

戻す場合

```bash
git update-index --no-skip-worktree src/types/route.d.mts
```
