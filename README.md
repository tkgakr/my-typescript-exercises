# my-typescript-exercises

[typescript-exercises](https://github.com/typescript-exercises/typescript-exercises) の各問題に対する自分用ソリューションをまとめたリポジトリです。

## 学習環境の起動

```bash
# VSCodeでプロジェクトを開く
cd my-typescript-exercises
code .

# Dev Containerを起動
# Cmd/Ctrl + Shift + P → "Dev Containers: Reopen in Container"
```

## サブモジュールの最新化

original-typescript-exercises を最新版に更新したい場合は、以下のスクリプトを実行します。

```bash
sh scripts/update-submodule.sh
```

実行後、変更を親リポジトリにコミットしてください。

```bash
git add original-typescript-exercises
git commit -m "chore: update original-typescript-exercises submodule"
```

## 学習フロー

1. エクササイズを開始

    ```bash
    sh scripts/solve.sh 1
    ```

2. ソリューションを編集（IDE上で）

    - `solutions/exercise-XX/index.ts` に解答を記述する
    - `solutions/exercise-XX/solution-notes.md` に学習メモを記述する
    - 全体をタイプチェックしたい場合は npm コマンドでチェックする

        ```bash
        npm run check
        ```

3. Gitで進捗を更新
