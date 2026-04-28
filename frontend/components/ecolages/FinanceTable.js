"use client";

function getStatusBadgeClass(statut) {
  if (statut === "paye") return "bg-emerald-100 text-emerald-700";
  if (statut === "partiel") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function formatCurrency(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default function FinanceTable({ items, loading, onPayStripe, onDownloadPdf, onSendSms }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-semibold">Élève</th>
              <th className="px-4 py-3 font-semibold">Cours</th>
              <th className="px-4 py-3 font-semibold">Montant Total</th>
              <th className="px-4 py-3 font-semibold">Payé</th>
              <th className="px-4 py-3 font-semibold">Solde</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">Aucune donnée financière trouvée.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 text-sm text-slate-700">
                  <td className="px-4 py-3"><div className="font-medium text-slate-900">{item.eleveNom}</div><div className="text-xs text-slate-500">{item.eleveEmail}</div></td>
                  <td className="px-4 py-3">{item.coursNom}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(item.montantTotal)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.montantPaye)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.solde)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(item.statut)}`}>{item.statut}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => onPayStripe(item)} className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700">Stripe</button>
                      <button type="button" onClick={() => onDownloadPdf(item)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">PDF</button>
                      <button type="button" onClick={() => onSendSms(item)} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50">SMS</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
