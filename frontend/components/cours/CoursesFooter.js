"use client";

export default function CoursesFooter() {
  function handleExportPdf() {
    window.print();
  }

  return (
    <footer className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Export</h4>
          <p className="mt-1 text-sm text-slate-600">Utilise l’impression navigateur pour enregistrer la vue calendrier en PDF.</p>
        </div>
        <button type="button" onClick={handleExportPdf} className="rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Exporter en PDF</button>
      </div>
    </footer>
  );
}
