"use client";

import { useMemo } from "react";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOUR_ROW_HEIGHT = 64;

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function flattenCoursToBlocks(cours) {
  return (cours || []).flatMap((course) =>
    (course.planning || []).map((entry) => ({
      coursId: course.id,
      coursNom: course.nom,
      description: course.description,
      capacite: course.capacite,
      inscrits: course.inscrits || 0,
      sessionId: entry.sessionId,
      title: entry.title || course.nom,
      dayOfWeek: Number(entry.dayOfWeek),
      startHour: Number(entry.startHour),
      endHour: Number(entry.endHour),
      room: entry.room || "Salle A",
      color: entry.color || "#2563eb"
    }))
  );
}

export default function WeeklyCalendar({ cours, weekStart, loading, onMoveSession, onDeleteCourse }) {
  const blocks = useMemo(() => flattenCoursToBlocks(cours), [cours]);

  function handleDragStart(event, block) {
    event.dataTransfer.setData("application/json", JSON.stringify({ coursId: block.coursId, sessionId: block.sessionId, duration: block.endHour - block.startHour }));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(event, dayOfWeek, hour) {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const duration = Number(data.duration || 1);
      onMoveSession({ coursId: data.coursId, sessionId: data.sessionId, dayOfWeek, startHour: hour, endHour: Math.min(24, hour + duration) });
    } catch (error) {
      console.error("Erreur drag-and-drop:", error);
    }
  }

  const totalGridHeight = HOUR_ROW_HEIGHT * 24;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm print-calendar">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">Calendrier hebdomadaire</h3>
        <p className="mt-2 text-sm text-slate-600">Glisse-dépose les blocs de sessions vers un nouveau jour ou créneau horaire.</p>
      </div>
      {loading ? (
        <div className="px-6 py-10 text-sm text-slate-500">Chargement du calendrier...</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]" style={{ display: "grid", gridTemplateColumns: "90px repeat(7, minmax(150px, 1fr))" }}>
            <div className="sticky left-0 z-10 border-r border-slate-200 bg-white" />
            {DAYS.map((day, index) => {
              const dayDate = addDays(weekStart, index);
              return (
                <div key={day} className="border-r border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <div className="font-semibold text-slate-900">{day}</div>
                  <div className="mt-1 text-xs text-slate-500">{dayDate.toLocaleDateString("fr-FR")}</div>
                </div>
              );
            })}
            <div className="relative border-r border-slate-200 bg-white">
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="border-b border-slate-200 px-3 pt-2 text-xs text-slate-500" style={{ height: `${HOUR_ROW_HEIGHT}px` }}>{formatHour(hour)}</div>
              ))}
            </div>
            {DAYS.map((day, dayIndex) => {
              const dayBlocks = blocks.filter((block) => block.dayOfWeek === dayIndex);
              return (
                <div key={dayIndex} className="relative border-r border-slate-200 bg-white" style={{ height: `${totalGridHeight}px` }}>
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div key={`${dayIndex}-${hour}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, dayIndex, hour)} className="border-b border-slate-200 transition-colors hover:bg-blue-50" style={{ height: `${HOUR_ROW_HEIGHT}px` }} aria-label={`Déposer une session le ${day} à ${formatHour(hour)}`} />
                  ))}
                  {dayBlocks.map((block) => {
                    const top = block.startHour * HOUR_ROW_HEIGHT + 2;
                    const height = (block.endHour - block.startHour) * HOUR_ROW_HEIGHT - 4;
                    return (
                      <div key={block.sessionId} draggable onDragStart={(event) => handleDragStart(event, block)} className="absolute left-1 right-1 cursor-move rounded-2xl border border-white/30 p-3 text-white shadow-lg" style={{ top: `${top}px`, height: `${height}px`, background: block.color }} title={`${block.coursNom} - ${formatHour(block.startHour)} à ${formatHour(block.endHour)}`}>
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <div className="text-sm font-bold">{block.coursNom}</div>
                            <div className="mt-1 text-xs opacity-90">{formatHour(block.startHour)} - {formatHour(block.endHour)}</div>
                            <div className="mt-1 text-xs opacity-90">{block.room}</div>
                          </div>
                          <div className="mt-2 text-xs font-medium">{block.inscrits}/{block.capacite}</div>
                          <div className="mt-3 flex justify-end">
                            <button type="button" onClick={() => onDeleteCourse(block.coursId)} className="rounded-xl bg-white/20 px-2 py-1 text-[11px] hover:bg-white/30">Supprimer</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
