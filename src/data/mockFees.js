const BASE_AMOUNT = 500;
const LOYAL_DISCOUNT_RATE = 0.1;

function getDiscountAmount(isLoyal) {
    return isLoyal ? BASE_AMOUNT * LOYAL_DISCOUNT_RATE : 0;
}

function getFinalTotal(isLoyal) {
    return BASE_AMOUNT - getDiscountAmount(isLoyal);
}

function getStatus(totalAmount, paidAmount) {
    if (paidAmount <= 0) {
        return "unpaid";
    }

    if (paidAmount >= totalAmount) {
        return "paid";
    }

    return "partial";
}

function buildRecord(rawRecord) {
    const totalAmount = getFinalTotal(rawRecord.isLoyal);
    const paidAmount = Math.min(Number(rawRecord.paidAmount || 0), totalAmount);
    const balance = Math.max(totalAmount - paidAmount, 0);

    return {
        ...rawRecord,
        totalAmount,
        paidAmount,
        balance,
        status: getStatus(totalAmount, paidAmount)
    };
}

let feesDb = [
    buildRecord({
        id: 1,
        studentName: "Jean Dupont",
        courseName: "React Débutant",
        isLoyal: true,
        paidAmount: 300,
        email: "jean.dupont@gestioncours.pro",
        phone: "+261340000001"
    }),
    buildRecord({
        id: 2,
        studentName: "Jeanne Rakoto",
        courseName: "Tailwind CSS",
        isLoyal: false,
        paidAmount: 500,
        email: "jeanne.rakoto@gestioncours.pro",
        phone: "+261340000002"
    }),
    buildRecord({
        id: 3,
        studentName: "Mickaël Randria",
        courseName: "JavaScript Avancé",
        isLoyal: false,
        paidAmount: 0,
        email: "mickael.randria@gestioncours.pro",
        phone: "+261340000003"
    }),
    buildRecord({
        id: 4,
        studentName: "Sarah Johnson",
        courseName: "UI/UX Fondamentaux",
        isLoyal: true,
        paidAmount: 450,
        email: "sarah.johnson@gestioncours.pro",
        phone: "+261340000004"
    }),
    buildRecord({
        id: 5,
        studentName: "Aina Rasoanaivo",
        courseName: "Node.js Initiation",
        isLoyal: false,
        paidAmount: 150,
        email: "aina.rasoanaivo@gestioncours.pro",
        phone: "+261340000005"
    })
];

const monthlyRecoveryData = [
    { month: "Jan", rate: 68 },
    { month: "Fév", rate: 74 },
    { month: "Mar", rate: 81 },
    { month: "Avr", rate: 79 },
    { month: "Mai", rate: 86 },
    { month: "Juin", rate: 91 }
];

export function calculateTuition({ isLoyal }) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const discountAmount = getDiscountAmount(isLoyal);
            const finalTotal = getFinalTotal(isLoyal);

            resolve({
                endpoint: "/api/ecolage/calcul",
                data: {
                    baseAmount: BASE_AMOUNT,
                    discountRate: isLoyal ? LOYAL_DISCOUNT_RATE : 0,
                    discountAmount,
                    finalTotal,
                    isLoyal
                }
            });
        }, 400);
    });
}

export function getFeesRecords() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                endpoint: "/api/ecolages",
                data: [...feesDb]
            });
        }, 700);
    });
}

export function getRecoveryChartData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                endpoint: "/api/ecolages/recouvrement-mensuel",
                data: monthlyRecoveryData
            });
        }, 500);
    });
}

export function payTuition(recordId, payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingRecord = feesDb.find((item) => item.id === recordId);

            if (!existingRecord) {
                reject(new Error("Écolage introuvable."));
                return;
            }

            const isLoyal = Boolean(payload.isLoyal);
            const paymentAmount = Number(payload.amount);
            const method = payload.method;

            if (paymentAmount <= 0) {
                reject(new Error("Le montant à payer doit être supérieur à 0."));
                return;
            }

            if (method === "mobileMoney") {
                if (!String(payload.phoneNumber || "").trim()) {
                    reject(new Error("Le numéro de téléphone Mobile Money est requis."));
                    return;
                }

                if (!String(payload.transactionReference || "").trim()) {
                    reject(new Error("La référence transaction est requise."));
                    return;
                }
            }

            if (method === "cash") {
                const hasCashBreakdown =
                    payload.cashBreakdown &&
                    Object.values(payload.cashBreakdown).some(
                        (value) => Number(value || 0) > 0
                    );

                if (!hasCashBreakdown) {
                    reject(new Error("Le billetage est requis pour un paiement cash."));
                    return;
                }
            }

            const recalculatedTotal = getFinalTotal(isLoyal);
            const currentPaid = Math.min(existingRecord.paidAmount, recalculatedTotal);
            const nextPaidAmount = Math.min(currentPaid + paymentAmount, recalculatedTotal);

            const updatedRecord = buildRecord({
                ...existingRecord,
                isLoyal,
                paidAmount: nextPaidAmount,
                paymentMethod: method,
                phone: payload.phoneNumber || existingRecord.phone || "",
                transactionReference: payload.transactionReference || ""
            });

            feesDb = feesDb.map((item) => (item.id === recordId ? updatedRecord : item));

            resolve({
                endpoint: `/api/ecolages/${recordId}/paiement`,
                data: updatedRecord
            });
        }, 800);
    });
}

export function sendReminder(recordId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const record = feesDb.find((item) => item.id === recordId);

            if (!record) {
                reject(new Error("Écolage introuvable."));
                return;
            }

            resolve({
                endpoint: "/api/notifications/twilio",
                data: {
                    success: true,
                    message: `Rappel SMS/Email envoyé à ${record.studentName}.`
                }
            });
        }, 600);
    });
}