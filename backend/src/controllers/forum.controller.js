import { query } from "../config/db.js";
import { simulateForumNotification } from "../utils/forum-notification.js";

export async function listThreads(req, res) {
  try {
    const { scope = "global", coursId, page = 1, limit = 20 } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.min(50, Math.max(1, Number(limit) || 20));
    const offset = (numericPage - 1) * numericLimit;

    const conditions = ["p.parent_id IS NULL", "p.is_spam = FALSE"];
    const params = [];

    if (scope === "global") conditions.push("p.cours_id IS NULL");
    else if (scope === "course") {
      params.push(Number(coursId));
      conditions.push(`p.cours_id = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    params.push(numericLimit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const threadsResult = await query(
      `SELECT p.id, p.titre, p.contenu, p.likes, p.created_at, p.updated_at, p.cours_id,
              u.id AS author_id, u.nom AS author_name, c.nom AS cours_nom,
              COUNT(DISTINCT r.id)::int AS replies_count,
              COUNT(DISTINCT fa.id)::int AS attachments_count
       FROM posts p
       INNER JOIN users u ON u.id = p.user_id
       LEFT JOIN cours c ON c.id = p.cours_id
       LEFT JOIN posts r ON r.parent_id = p.id AND r.is_spam = FALSE
       LEFT JOIN forum_attachments fa ON fa.post_id = p.id
       ${whereClause}
       GROUP BY p.id, u.id, u.nom, c.nom
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT $${limitIdx}
       OFFSET $${offsetIdx}`,
      params
    );

    const threadIds = threadsResult.rows.map((row) => row.id);
    const attachmentsByPostId = {};
    if (threadIds.length) {
      const attachmentsResult = await query(
        `SELECT id, post_id, original_name, mime_type, size_bytes, storage_path FROM forum_attachments WHERE post_id = ANY($1::bigint[]) ORDER BY id ASC`,
        [threadIds]
      );
      attachmentsResult.rows.forEach((item) => {
        if (!attachmentsByPostId[item.post_id]) attachmentsByPostId[item.post_id] = [];
        attachmentsByPostId[item.post_id].push({
          id: item.id,
          originalName: item.original_name,
          mimeType: item.mime_type,
          sizeBytes: item.size_bytes,
          url: `/${String(item.storage_path).replace(/\\/g, "/")}`
        });
      });
    }

    return res.status(200).json({
      items: threadsResult.rows.map((row) => ({
        id: row.id,
        titre: row.titre,
        contenu: row.contenu,
        likes: Number(row.likes || 0),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        coursId: row.cours_id,
        coursNom: row.cours_nom,
        author: { id: row.author_id, nom: row.author_name },
        repliesCount: Number(row.replies_count || 0),
        attachmentsCount: Number(row.attachments_count || 0),
        attachments: attachmentsByPostId[row.id] || []
      }))
    });
  } catch (error) {
    console.error("listThreads error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des threads." });
  }
}

export async function listReplies(req, res) {
  try {
    const { postId } = req.params;
    const repliesResult = await query(
      `SELECT p.id, p.contenu, p.likes, p.created_at, u.id AS author_id, u.nom AS author_name
       FROM posts p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.parent_id = $1 AND p.is_spam = FALSE
       ORDER BY p.created_at ASC, p.id ASC`,
      [postId]
    );
    return res.status(200).json({
      items: repliesResult.rows.map((row) => ({
        id: row.id,
        contenu: row.contenu,
        likes: Number(row.likes || 0),
        createdAt: row.created_at,
        author: { id: row.author_id, nom: row.author_name }
      }))
    });
  } catch (error) {
    console.error("listReplies error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des réponses." });
  }
}

export async function createPost(req, res) {
  try {
    const { coursId } = req.params;
    const { titre, contenu } = req.body;
    if (!titre || !contenu) return res.status(400).json({ message: "titre et contenu sont obligatoires." });

    const finalCoursId = coursId === "global" ? null : Number(coursId);
    const postResult = await query(
      `INSERT INTO posts (cours_id, user_id, contenu, likes, titre, parent_id)
       VALUES ($1, $2, $3, 0, $4, NULL)
       RETURNING id, cours_id, user_id, titre, contenu, likes, created_at`,
      [finalCoursId, req.user.sub, contenu, titre]
    );
    const post = postResult.rows[0];
    let attachment = null;

    if (req.file) {
      const storagePath = `uploads/forum/${req.file.filename}`;
      const attachmentResult = await query(
        `INSERT INTO forum_attachments (post_id, original_name, mime_type, size_bytes, storage_path)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, original_name, mime_type, size_bytes, storage_path`,
        [post.id, req.file.originalname, req.file.mimetype, req.file.size, storagePath]
      );
      const row = attachmentResult.rows[0];
      attachment = { id: row.id, originalName: row.original_name, mimeType: row.mime_type, sizeBytes: row.size_bytes, url: `/${row.storage_path}` };
    }

    await simulateForumNotification({ type: "new_post", titre, contenu, coursId: finalCoursId, postId: post.id });
    return res.status(201).json({
      message: "Post créé avec succès.",
      item: {
        id: post.id,
        coursId: post.cours_id,
        userId: post.user_id,
        titre: post.titre,
        contenu: post.contenu,
        likes: Number(post.likes || 0),
        createdAt: post.created_at,
        attachments: attachment ? [attachment] : [],
        repliesCount: 0
      }
    });
  } catch (error) {
    console.error("createPost error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du post." });
  }
}

export async function patchThread(req, res) {
  try {
    const { postId } = req.params;
    const { action, contenu } = req.body;
    if (!["like", "reply"].includes(action)) return res.status(400).json({ message: "action invalide." });

    if (action === "like") {
      const likeResult = await query(`UPDATE posts SET likes = likes + 1, updated_at = NOW() WHERE id = $1 RETURNING id, likes`, [postId]);
      if (!likeResult.rows.length) return res.status(404).json({ message: "Post introuvable." });
      return res.status(200).json({ message: "Like ajouté.", item: { id: likeResult.rows[0].id, likes: Number(likeResult.rows[0].likes || 0) } });
    }

    if (!contenu) return res.status(400).json({ message: "contenu est obligatoire pour une réponse." });
    const originalPostResult = await query(`SELECT id, cours_id, titre FROM posts WHERE id = $1 LIMIT 1`, [postId]);
    if (!originalPostResult.rows.length) return res.status(404).json({ message: "Thread introuvable." });

    const original = originalPostResult.rows[0];
    const replyResult = await query(
      `INSERT INTO posts (cours_id, user_id, contenu, likes, titre, parent_id)
       VALUES ($1, $2, $3, 0, $4, $5)
       RETURNING id, cours_id, user_id, contenu, likes, titre, created_at`,
      [original.cours_id, req.user.sub, contenu, `Re: ${original.titre || "Réponse"}`, original.id]
    );

    await simulateForumNotification({ type: "reply", titre: original.titre, contenu, coursId: original.cours_id, postId: original.id });
    return res.status(201).json({
      message: "Réponse ajoutée.",
      item: {
        id: replyResult.rows[0].id,
        coursId: replyResult.rows[0].cours_id,
        userId: replyResult.rows[0].user_id,
        contenu: replyResult.rows[0].contenu,
        likes: Number(replyResult.rows[0].likes || 0),
        titre: replyResult.rows[0].titre,
        createdAt: replyResult.rows[0].created_at,
        parentId: original.id
      }
    });
  } catch (error) {
    console.error("patchThread error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du thread." });
  }
}

export async function searchPosts(req, res) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: "Le paramètre q est obligatoire." });

    const result = await query(
      `SELECT p.id, p.titre, p.contenu, p.likes, p.created_at, p.cours_id,
              u.nom AS author_name, c.nom AS cours_nom,
              COUNT(DISTINCT r.id)::int AS replies_count
       FROM posts p
       INNER JOIN users u ON u.id = p.user_id
       LEFT JOIN cours c ON c.id = p.cours_id
       LEFT JOIN posts r ON r.parent_id = p.id AND r.is_spam = FALSE
       WHERE p.parent_id IS NULL AND p.is_spam = FALSE AND p.search_vector @@ plainto_tsquery('simple', $1)
       GROUP BY p.id, u.nom, c.nom
       ORDER BY ts_rank(p.search_vector, plainto_tsquery('simple', $1)) DESC, p.created_at DESC
       LIMIT 50`,
      [q.trim()]
    );

    return res.status(200).json({
      items: result.rows.map((row) => ({
        id: row.id,
        titre: row.titre,
        contenu: row.contenu,
        likes: Number(row.likes || 0),
        createdAt: row.created_at,
        coursId: row.cours_id,
        coursNom: row.cours_nom,
        authorName: row.author_name,
        repliesCount: Number(row.replies_count || 0)
      }))
    });
  } catch (error) {
    console.error("searchPosts error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
}

export async function signalPost(req, res) {
  try {
    const { postId } = req.params;
    const result = await query(
      `UPDATE posts
       SET spam_reports = spam_reports + 1,
           is_spam = CASE WHEN spam_reports + 1 >= 3 THEN TRUE ELSE is_spam END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, spam_reports, is_spam`,
      [postId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Post introuvable." });
    return res.status(200).json({
      message: "Signalement enregistré.",
      item: { id: result.rows[0].id, spamReports: Number(result.rows[0].spam_reports || 0), isSpam: result.rows[0].is_spam }
    });
  } catch (error) {
    console.error("signalPost error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du signalement." });
  }
}
