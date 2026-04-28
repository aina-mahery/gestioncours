"use client";

function getRoleBadgeClass(role) {
  if (role === "admin") return "bg-red-100 text-red-700";
  if (role === "formateur") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function getStatusBadgeClass(statut) {
  if (statut === "actif") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-200 text-slate-700";
}

function MemberAvatar({ member }) {
  if (member.photoBase64) {
    return <img src={`data:image/*;base64,${member.photoBase64}`} alt={member.nom} className="h-10 w-10 rounded-full object-cover" />;
  }
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">{member.nom?.charAt(0)?.toUpperCase() || "M"}</div>;
}

export default function MembersTable({ members, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-semibold">Photo</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Cours Inscrits</th>
              <th className="px-4 py-3 font-semibold">Solde</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">Chargement...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">Aucun membre trouvé.</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-slate-200 text-sm text-slate-700">
                  <td className="px-4 py-3"><MemberAvatar member={member} /></td>
                  <td className="px-4 py-3 font-medium text-slate-900">{member.nom}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(member.role)}`}>{member.role}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(member.statut)}`}>{member.statut}</span></td>
                  <td className="px-4 py-3">{member.coursInscrits}</td>
                  <td className="px-4 py-3">{Number(member.solde || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => onEdit(member)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Éditer</button>
                      <button type="button" onClick={() => onDelete(member.id)} className="rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50">Supprimer</button>
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
