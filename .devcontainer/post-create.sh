#!/bin/bash

echo "🚀 Dev Container セットアップを開始..."

# Node.jsバージョン確認
echo "📦 Node.js バージョン: $(node --version)"
echo "📦 npm バージョン: $(npm --version)"

# 依存関係のインストール
echo "📚 依存関係をインストール..."
npm install

# 実行権限を付与
chmod +x scripts/*.sh 2>/dev/null || true

# Node.jsバージョンチェック
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  警告: Node.js 20以上を推奨します（現在: v$NODE_VERSION）"
fi

# submodulesの同期（親リポジトリに記録されたコミットを使用）
echo "🔄 original-typescript-exercises の同期..."
git submodule update --init --recursive

echo "✅ セットアップ完了！"
