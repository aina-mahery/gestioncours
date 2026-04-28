"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RecoveryChart({ data }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Taux de recouvrement mensuel</h3>
        <p className="mt-2 text-sm text-slate-600">Ratio mensuel entre les montants payés et les montants dus.</p>
      </div>
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" domain={[0, 100]} unit="%" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="recoveryRate" stroke="#2563eb" strokeWidth={3} name="Taux de recouvrement" />
            <Line yAxisId="right" type="monotone" dataKey="totalDue" stroke="#dc2626" strokeWidth={2} name="Montant dû" />
            <Line yAxisId="right" type="monotone" dataKey="totalPaid" stroke="#059669" strokeWidth={2} name="Montant payé" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
