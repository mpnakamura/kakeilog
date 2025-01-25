export default function CategoryBreakdown() {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h2 className="text-lg font-bold mb-2">カテゴリ別内訳</h2>
      <ul className="list-disc pl-6">
        <li>食費: ¥50,000</li>
        <li>交通費: ¥15,000</li>
        <li>家賃: ¥60,000</li>
        <li>その他: ¥0</li>
      </ul>
    </div>
  );
}
