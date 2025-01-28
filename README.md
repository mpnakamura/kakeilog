# 家計ログ


![ダッシュボード](https://github.com/user-attachments/assets/709f1e13-107a-44ea-a59a-549763792adf)

- 家計簿アプリケーション。収入と支出を記録・管理し、カテゴリごとの分析や月次レポートを提供します。
- DeepSeekのAPI連携による直近２ヶ月の分析が可能です。

## 特徴

- 収入・支出の登録と管理
- カテゴリとサブカテゴリによる分類
- 支出の定期的なコピー機能
- 月次サマリーと分析
- AIによる分析

## 技術スタック

- [Next.js](https://nextjs.org/) - フレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 開発言語
- [Supabase](https://supabase.com/) - バックエンド
- [Prisma](https://www.prisma.io/) - ORM
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [DeepSeek API](https://chat.deepseek.com/)

## セットアップ

### 必要条件

- Node.js 18.x以上
- npm
- Supabase アカウント
- DeepSeek API アカウント

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/kakeilog.git
cd kakeilog

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
```

### 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

DATABASE_URL=""

DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=

```

### データベースのセットアップ

1. Supabaseでプロジェクトを作成
2. Prismaデータプッシュ

```bash
npx prisma db push
```

3. Prisma seed

```bash
npx prisma db seed
```
### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスできます。

## デプロイ

Vercelを使用したデプロイを推奨します：

1. Vercelでプロジェクトを作成
2. 環境変数を設定
3. デプロイを実行

## ライセンス

[MIT](https://choosealicense.com/licenses/mit/)

## 貢献

IssuesやPull Requestsを歓迎します。大きな変更を加える場合は、まずIssueを作成して変更内容を議論しましょう。

## 作者

- [@mpnakamura](https://github.com/mpnakamura)
