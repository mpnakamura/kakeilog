const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

// 収入カテゴリ（income）
const DEFAULT_INCOME_CATEGORIES = [
  { name: "給与" },
  { name: "賞与" },
  { name: "事業収入" },
  { name: "副業" },
  { name: "投資収入" },
  { name: "雑収入" },
  { name: "その他" },
];

// 支出カテゴリ（expense）
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "食費" },
  { name: "住居費" },
  { name: "光熱費" },
  { name: "交通費" },
  { name: "通信費" },
  { name: "娯楽費" },
  { name: "美容費" },
  { name: "医療費" },
  { name: "教育費" },
  { name: "保険" },
  { name: "税金" },
  { name: "家具" },
  { name: "交際費" },
  { name: "ペット費" },
  { name: "クレジットカード" },
  { name: "借入" },
  { name: "その他" },
];

async function main() {
  // 収入カテゴリを upsert
  for (const category of DEFAULT_INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name }, // name でユニーク検索
      update: {
        // 既にあれば type を income に更新したい場合はこう書く
        // （既存のレコードの type を変えたくないなら {} のままでもOK）
        type: "income",
      },
      create: {
        id: uuidv4(),
        name: category.name,
        type: "income",
      },
    });
  }

  // 支出カテゴリを upsert
  for (const category of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        type: "expense",
      },
      create: {
        id: uuidv4(),
        name: category.name,
        type: "expense",
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
