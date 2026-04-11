let membersDb = [
    {
        id: 1,
        name: "Jean Dupont",
        email: "jean.dupont@gestioncours.pro",
        role: "eleve",
        status: "actif",
        courses: ["React Débutant", "JavaScript Fondamentaux"],
        balance: 0,
        photo: ""
    },
    {
        id: 2,
        name: "Jeanne Rakoto",
        email: "jeanne.rakoto@gestioncours.pro",
        role: "eleve",
        status: "actif",
        courses: ["UI/UX Basics"],
        balance: 350,
        photo: ""
    },
    {
        id: 3,
        name: "Jeanette Martin",
        email: "jeanette.martin@gestioncours.pro",
        role: "eleve",
        status: "en_retard",
        courses: ["Tailwind CSS", "React Avancé", "Git & GitHub"],
        balance: 120,
        photo: ""
    },
    {
        id: 4,
        name: "Aina Rasoanaivo",
        email: "aina.admin@gestioncours.pro",
        role: "admin",
        status: "actif",
        courses: [],
        balance: 0,
        photo: ""
    },
    {
        id: 5,
        name: "Mickaël Randria",
        email: "mickael.formateur@gestioncours.pro",
        role: "formateur",
        status: "actif",
        courses: ["React Débutant", "Tailwind CSS"],
        balance: 0,
        photo: ""
    },
    {
        id: 6,
        name: "Sarah Johnson",
        email: "sarah.student@gestioncours.pro",
        role: "eleve",
        status: "inactif",
        courses: ["Node.js Initiation"],
        balance: 560,
        photo: ""
    }
];

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function getMembers(params = {}) {
    const { role = "", search = "", status = "" } = params;

    return new Promise((resolve) => {
        setTimeout(() => {
            let results = [...membersDb];

            if (role) {
                results = results.filter((member) => member.role === role);
            }

            if (status) {
                results = results.filter((member) => member.status === status);
            }

            if (search) {
                const term = normalizeText(search);
                results = results.filter((member) => {
                    const searchable = normalizeText(`${member.name} ${member.email}`);
                    return searchable.includes(term);
                });
            }

            resolve({
                endpoint: `/api/membres?role=${role}&search=${search}${status ? `&status=${status}` : ""}`,
                data: results
            });
        }, 700);
    });
}

export function createMember(payload) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newMember = {
                id: Date.now(),
                name: payload.name,
                email: payload.email,
                role: payload.role,
                status: "actif",
                photo: payload.photo || "",
                courses: [],
                balance: 0
            };

            membersDb = [newMember, ...membersDb];
            resolve(newMember);
        }, 500);
    });
}

export function updateMember(id, payload) {
    return new Promise((resolve) => {
        setTimeout(() => {
            membersDb = membersDb.map((member) =>
                member.id === id
                    ? {
                        ...member,
                        name: payload.name,
                        email: payload.email,
                        role: payload.role,
                        photo: payload.photo || member.photo
                    }
                    : member
            );

            const updatedMember = membersDb.find((member) => member.id === id);
            resolve(updatedMember);
        }, 500);
    });
}

export function deleteMember(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            membersDb = membersDb.filter((member) => member.id !== id);
            resolve({ success: true });
        }, 400);
    });
}

export function importMembersFromCsvMock() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const importedMembers = [
                {
                    id: Date.now() + 1,
                    name: "Jean Claude Mamy",
                    email: "jean.claude@gestioncours.pro",
                    role: "eleve",
                    status: "actif",
                    courses: ["Excel Pro"],
                    balance: 90,
                    photo: ""
                },
                {
                    id: Date.now() + 2,
                    name: "Nadia Formatrice",
                    email: "nadia.formateur@gestioncours.pro",
                    role: "formateur",
                    status: "actif",
                    courses: ["Communication"],
                    balance: 0,
                    photo: ""
                }
            ];

            membersDb = [...importedMembers, ...membersDb];
            resolve({
                inserted: importedMembers.length,
                items: importedMembers
            });
        }, 900);
    });
}