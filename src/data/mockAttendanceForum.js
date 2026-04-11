function getCurrentHourMinute() {
    return new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

let attendanceDb = [
    { id: 1, name: "Jean Dupont", status: "present", arrivalTime: "08:00" },
    { id: 2, name: "Jeanne Rakoto", status: "present", arrivalTime: "08:03" },
    { id: 3, name: "Jeanette Martin", status: "present", arrivalTime: "08:05" },
    { id: 4, name: "Mickaël Randria", status: "present", arrivalTime: "08:01" },
    { id: 5, name: "Sarah Johnson", status: "present", arrivalTime: "08:04" },
    { id: 6, name: "Aina Rasoanaivo", status: "present", arrivalTime: "08:06" },
    { id: 7, name: "Luc Andriama", status: "present", arrivalTime: "08:02" },
    { id: 8, name: "Nadia Formatrice", status: "present", arrivalTime: "08:00" },
    { id: 9, name: "Kevin Rakotomalala", status: "present", arrivalTime: "08:07" },
    { id: 10, name: "Claire David", status: "present", arrivalTime: "08:08" },
    { id: 11, name: "Rita Benson", status: "late", arrivalTime: "08:15" },
    { id: 12, name: "Tom Lucas", status: "absent", arrivalTime: "" }
];

let forumPostsDb = [
    {
        id: 101,
        scope: "react",
        title: "Problème avec useEffect et les dépendances",
        content:
            "Bonjour à tous, j’ai un souci avec mon useEffect qui se déclenche trop souvent dans mon composant React. J’aimerais comprendre comment stabiliser les dépendances et éviter les re-renders inutiles.",
        attachment: {
            name: "useeffect-debug.pdf",
            sizeMb: 1.8,
            type: "application/pdf"
        },
        likesCount: 12,
        repliesCount: 3,
        likedByUser: false,
        author: "Jean Dupont",
        createdAt: "2026-04-10 09:30"
    },
    {
        id: 102,
        scope: "react",
        title: "Astuce pour organiser un projet React + Tailwind",
        content:
            "Je partage ici une structure simple pour démarrer un projet frontend évolutif avec React Router, des pages bien séparées et des composants réutilisables. Cela peut aider les nouveaux arrivants.",
        attachment: null,
        likesCount: 8,
        repliesCount: 2,
        likedByUser: true,
        author: "Jeanne Rakoto",
        createdAt: "2026-04-10 14:20"
    },
    {
        id: 103,
        scope: "global",
        title: "Annonce : maintenance de la plateforme samedi",
        content:
            "La plateforme sera en maintenance samedi matin entre 08h00 et 10h00. Merci de sauvegarder vos travaux et de terminer vos activités avant cette plage horaire.",
        attachment: {
            name: "maintenance-note.pdf",
            sizeMb: 0.9,
            type: "application/pdf"
        },
        likesCount: 15,
        repliesCount: 1,
        likedByUser: false,
        author: "Admin",
        createdAt: "2026-04-09 18:10"
    },
    {
        id: 104,
        scope: "global",
        title: "Demande de support pour accès au forum",
        content:
            "Bonjour, je n’arrive pas à retrouver certains anciens sujets du forum global. Est-ce qu’il existe une archive ou un système de filtrage avancé ?",
        attachment: null,
        likesCount: 4,
        repliesCount: 5,
        likedByUser: false,
        author: "Sarah Johnson",
        createdAt: "2026-04-11 07:45"
    }
];

export function getAttendanceRecords() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                endpoint: "/api/presences?course=react",
                data: [...attendanceDb]
            });
        }, 600);
    });
}

export function patchAttendanceStatus(studentId, payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingStudent = attendanceDb.find((student) => student.id === studentId);

            if (!existingStudent) {
                reject(new Error("Élève introuvable."));
                return;
            }

            const nextArrivalTime =
                payload.status === "absent"
                    ? ""
                    : payload.arrivalTime || existingStudent.arrivalTime || getCurrentHourMinute();

            const updatedStudent = {
                ...existingStudent,
                status: payload.status,
                arrivalTime: nextArrivalTime
            };

            attendanceDb = attendanceDb.map((student) =>
                student.id === studentId ? updatedStudent : student
            );

            resolve({
                endpoint: `/api/presences/${studentId}`,
                data: updatedStudent
            });
        }, 450);
    });
}

export function getForumPosts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                endpoint: "/api/forum/posts",
                data: [...forumPostsDb]
            });
        }, 650);
    });
}

export function toggleForumLike(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingPost = forumPostsDb.find((post) => post.id === postId);

            if (!existingPost) {
                reject(new Error("Post introuvable."));
                return;
            }

            const updatedPost = {
                ...existingPost,
                likedByUser: !existingPost.likedByUser,
                likesCount: existingPost.likedByUser
                    ? existingPost.likesCount - 1
                    : existingPost.likesCount + 1
            };

            forumPostsDb = forumPostsDb.map((post) => (post.id === postId ? updatedPost : post));

            resolve({
                endpoint: `/api/forum/posts/${postId}/like`,
                data: updatedPost
            });
        }, 300);
    });
}

export function createForumPost(payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!payload.title?.trim()) {
                reject(new Error("Le titre du post est requis."));
                return;
            }

            if (!payload.content?.trim()) {
                reject(new Error("Le contenu du post est requis."));
                return;
            }

            if (payload.attachment) {
                const isPdf = payload.attachment.type === "application/pdf";
                const isSmallEnough = payload.attachment.sizeMb <= 5;

                if (!isPdf) {
                    reject(new Error("Seuls les fichiers PDF sont acceptés dans cette simulation."));
                    return;
                }

                if (!isSmallEnough) {
                    reject(new Error("Le PDF doit faire moins de 5 Mo."));
                    return;
                }
            }

            const newPost = {
                id: Date.now(),
                scope: payload.scope,
                title: payload.title,
                content: payload.content,
                attachment: payload.attachment || null,
                likesCount: 0,
                repliesCount: 0,
                likedByUser: false,
                author: "Moi",
                createdAt: new Date().toLocaleString("fr-FR")
            };

            forumPostsDb = [newPost, ...forumPostsDb];

            resolve({
                endpoint: "/api/forum/posts",
                data: newPost
            });
        }, 550);
    });
}