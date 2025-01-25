interface SummaryCardProps {
  title: string;
  amount: string;
}

export default function SummaryCard({ title, amount }: SummaryCardProps) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-2xl font-semibold">{amount}</p>
    </div>
  );
}
