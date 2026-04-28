import { query } from "../config/db.js";

export async function getAdminDashboard(req, res) {
  try {
    const cardsResult = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM cours) AS courses_count,
         (SELECT COALESCE(SUM(montant_paye), 0)::numeric(12,2) FROM paiements) AS total_revenue,
         (
           SELECT COALESCE(
             ROUND((SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 2),
             0
           )
           FROM presence
         ) AS average_attendance,
         (
           SELECT COUNT(*)::int
           FROM users
           WHERE statut = 'actif'
         ) AS active_users`
    );

    const paymentsMonthlyResult = await query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month_key,
              COALESCE(SUM(montant_paye), 0)::numeric(12,2) AS total_paid
       FROM paiements
       WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
       GROUP BY 1
       ORDER BY 1 ASC`
    );

    const absenceMonthlyResult = await query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month_key,
              COALESCE(ROUND((SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 2), 0) AS absence_rate
       FROM presence
       WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
       GROUP BY 1
       ORDER BY 1 ASC`
    );

    const cards = cardsResult.rows[0];
    return res.status(200).json({
      cards: {
        coursesCount: Number(cards.courses_count || 0),
        totalRevenue: Number(cards.total_revenue || 0),
        averageAttendance: Number(cards.average_attendance || 0),
        activeUsers: Number(cards.active_users || 0)
      },
      charts: {
        monthlyPayments: paymentsMonthlyResult.rows.map((row) => ({ month: row.month_key, totalPaid: Number(row.total_paid || 0) })),
        absenceRate: absenceMonthlyResult.rows.map((row) => ({ month: row.month_key, absenceRate: Number(row.absence_rate || 0) }))
      }
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement du dashboard admin." });
  }
}
