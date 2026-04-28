"use client";

function formatCurrency(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default function SummaryCards({ cards }) {
  const items = [
    { title: "Nombre de cours", value: cards.coursesCount || 0 },
    { title: "Recettes totales", value: formatCurrency(cards.totalRevenue) },
    { title: "Présence moyenne", value: `${Number(cards.averageAttendance || 0).toFixed(0)}%` },
    { title: "Utilisateurs actifs", value: cards.activeUsers || 0 }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{item.title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{item.value}</h3>
        </div>
      ))}
    </div>
  );
}
