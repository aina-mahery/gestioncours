export default function PlaceholderPage({ title }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-500">
                Cette page sera développée dans les prochaines étapes.
            </p>
        </div>
    );
}