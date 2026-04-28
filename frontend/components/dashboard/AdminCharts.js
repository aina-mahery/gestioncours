"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminCharts({ charts }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Paiements mensuels</h3>
          <p className="mt-2 text-sm text-slate-600">Montants effectivement encaissés sur les derniers mois.</p>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyPayments || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPaid" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Taux d’absence</h3>
          <p className="mt-2 text-sm text-slate-600">Évolution du taux d’absence mensuel.</p>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.absenceRate || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="absenceRate" stroke="#dc2626" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
