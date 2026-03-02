#!/bin/bash

# カラー出力の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 使用方法を表示
show_usage() {
    echo "使用方法: solve.sh <番号>"
    echo "例: sh scripts/solve.sh 1"
    echo ""
    echo "エクササイズ番号（1-16）を指定してください"
}

# 引数チェック
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

EXERCISE_NUM=$1
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)

# 番号のバリデーション
if [ "$EXERCISE_NUM" -lt 1 ] || [ "$EXERCISE_NUM" -gt 16 ] 2>/dev/null; then
    echo -e "${RED}❌ エクササイズ番号は 1-16 の範囲で指定してください${NC}"
    exit 1
fi

# ゼロ埋め（2桁）
EXERCISE_NUM_PADDED=$(printf "%02d" "$EXERCISE_NUM")

# 元のエクササイズディレクトリを確認
EXERCISE_SRC="original-typescript-exercises/src/exercises/${EXERCISE_NUM}"

if [ ! -d "$EXERCISE_SRC" ]; then
    echo -e "${RED}❌ エクササイズが見つかりません: ${EXERCISE_SRC}${NC}"
    echo -e "${YELLOW}ヒント: git submodule update --init --recursive を実行してください${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 エクササイズ ${EXERCISE_NUM} を準備中...${NC}"

# ソリューションディレクトリを作成
SOLUTION_DIR="solutions/exercise-${EXERCISE_NUM_PADDED}"

if [ -d "$SOLUTION_DIR" ]; then
    echo -e "${YELLOW}⚠️  ${SOLUTION_DIR} は既に存在します。上書きしますか？ (y/N)${NC}"
    read -r answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo -e "${BLUE}スキップしました${NC}"
        exit 0
    fi
fi

mkdir -p "$SOLUTION_DIR"

# エクササイズ一式を再帰コピー（index.solution.* は除外）
if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude='index.solution.*' "${EXERCISE_SRC}/" "${SOLUTION_DIR}/"
    echo -e "${GREEN}  ✅ エクササイズファイルをコピーしました（index.solution.* を除外）${NC}"
else
    echo -e "${RED}❌ rsync コマンドが見つかりません${NC}"
    exit 1
fi

# solution-notes.md を生成
cat > "${SOLUTION_DIR}/solution-notes.md" << EOF
# Exercise ${EXERCISE_NUM}

**実施日**: ${DATE}

## 問題の概要
<!-- ここに問題の概要を記述 -->

## 解法

### アプローチ
<!-- ここに解法のアプローチを記述 -->

### 実装のポイント
<!-- 重要な実装ポイントを記述 -->

## 学習メモ

### 新しく学んだこと、再確認したこと
<!-- 新しい発見や学びを記述 -->

### つまずいたポイント
<!-- 難しかった部分とその解決方法 -->

### 参考リンク
<!-- 参考にした資料のリンク -->

---
*Generated at ${DATE} ${TIME}*
EOF
echo -e "${GREEN}  ✅ solution-notes.md を生成しました${NC}"

echo ""
echo -e "${GREEN}📁 ファイル作成完了: ${SOLUTION_DIR}${NC}"
echo -e "${BLUE}   index.ts を編集して型エラーを解消してください${NC}"
echo -e "${BLUE}   npm run check で型チェックを実行できます${NC}"
