const courseColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500"
];

export const weekDays = [
    { key: "monday", labelKey: "courses.days.monday" },
    { key: "tuesday", labelKey: "courses.days.tuesday" },
    { key: "wednesday", labelKey: "courses.days.wednesday" },
    { key: "thursday", labelKey: "courses.days.thursday" },
    { key: "friday", labelKey: "courses.days.friday" },
    { key: "saturday", labelKey: "courses.days.saturday" },
    { key: "sunday", labelKey: "courses.days.sunday" }
];

let coursesDb = [
    {
        id: 101,
        name: "React Débutant",
        description: "Introduction à React et aux composants.",
        durationHours: 40,
        day: "monday",
        startHour: 14,
        endHour: 17,
        room: "Salle A",
        enrolled: 12,
        capacity: 15,
        sessionsPerWeek: 2,
        color: "bg-blue-500"
    },
    {
        id: 102,
        name: "Tailwind CSS",
        description: "Création d’interfaces rapides et responsives.",
        durationHours: 24,
        day: "wednesday",
        startHour: 9,
        endHour: 12,
        room: "Salle B",
        enrolled: 10,
        capacity: 15,
        sessionsPerWeek: 2,
        color: "bg-emerald-500"
    },
    {
        id: 103,
        name: "JavaScript Avancé",
        description: "Fonctions, closures, async/await, patterns.",
        durationHours: 36,
        day: "friday",
        startHour: 13,
        endHour: 16,
        room: "Salle C",
        enrolled: 14,
        capacity: 18,
        sessionsPerWeek: 3,
        color: "bg-violet-500"
    },
    {
        id: 104,
        name: "UI/UX Fondamentaux",
        description: "Principes de design, accessibilité et prototypes.",
        durationHours: 20,
        day: "tuesday",
        startHour: 10,
        endHour: 12,
        room: "Salle D",
        enrolled: 8,
        capacity: 12,
        sessionsPerWeek: 1,
        color: "bg-amber-500"
    }
];

function validateCoursePayload(payload) {
    if (!payload.name?.trim()) {
        throw new Error("Le nom du cours est requis.");
    }

    if (!payload.description?.trim()) {
        throw new Error("La description du cours est requise.");
    }

    if (!payload.durationHours || Number(payload.durationHours) <= 0) {
        throw new Error("La durée doit être supérieure à 0.");
    }

    if (!payload.selectedDays || payload.selectedDays.length === 0) {
        throw new Error("Sélectionnez au moins un jour.");
    }

    if (!payload.sessionsPerWeek || Number(payload.sessionsPerWeek) <= 0) {
        throw new Error("Le nombre de sessions par semaine doit être supérieur à 0.");
    }

    if (Number(payload.startHour) < 0 || Number(payload.startHour) > 23) {
        throw new Error("L’heure de début est invalide.");
    }

    if (Number(payload.endHour) <= Number(payload.startHour) || Number(payload.endHour) > 24) {
        throw new Error("L’heure de fin doit être supérieure à l’heure de début.");
    }

    if (!payload.capacity || Number(payload.capacity) <= 0) {
        throw new Error("La capacité doit être supérieure à 0.");
    }
}

function getNextColor(index) {
    return courseColors[index % courseColors.length];
}

function getNextRoom(index) {
    const rooms = ["Salle A", "Salle B", "Salle C", "Salle D", "Salle E"];
    return rooms[index % rooms.length];
}

export function getWeeklyCourses() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                endpoint: "/api/cours?view=week",
                data: [...coursesDb]
            });
        }, 700);
    });
}

export function patchCoursePlanning(id, payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingCourse = coursesDb.find((course) => course.id === id);

            if (!existingCourse) {
                reject(new Error("Cours introuvable."));
                return;
            }

            if (payload.endHour > 24 || payload.startHour < 0 || payload.startHour >= payload.endHour) {
                reject(new Error("Créneau horaire invalide."));
                return;
            }

            coursesDb = coursesDb.map((course) =>
                course.id === id
                    ? {
                        ...course,
                        day: payload.day,
                        startHour: payload.startHour,
                        endHour: payload.endHour
                    }
                    : course
            );

            const updatedCourse = coursesDb.find((course) => course.id === id);

            resolve({
                endpoint: `/api/cours/${id}/planning`,
                data: updatedCourse
            });
        }, 500);
    });
}

export function createCourse(payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                validateCoursePayload(payload);

                const daysToCreate = payload.selectedDays.slice(
                    0,
                    Number(payload.sessionsPerWeek)
                );

                const insertedCourses = daysToCreate.map((day, index) => ({
                    id: Date.now() + index,
                    name: payload.name,
                    description: payload.description,
                    durationHours: Number(payload.durationHours),
                    day,
                    startHour: Number(payload.startHour),
                    endHour: Number(payload.endHour),
                    room: getNextRoom(index),
                    enrolled: 0,
                    capacity: Number(payload.capacity),
                    sessionsPerWeek: Number(payload.sessionsPerWeek),
                    color: getNextColor(coursesDb.length + index)
                }));

                coursesDb = [...insertedCourses, ...coursesDb];

                resolve({
                    endpoint: "/api/cours",
                    inserted: insertedCourses.length,
                    data: insertedCourses
                });
            } catch (error) {
                reject(error);
            }
        }, 700);
    });
}