import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { forumUpload } from "../middleware/forum-upload.middleware.js";
import { listThreads, listReplies, createPost, patchThread, searchPosts, signalPost } from "../controllers/forum.controller.js";

const router = Router();
router.get("/", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), listThreads);
router.get("/search", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), searchPosts);
router.get("/:postId/replies", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), listReplies);
router.post("/:coursId/posts", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), forumUpload.single("attachment"), createPost);
router.patch("/:postId", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), patchThread);
router.post("/:postId/signal", authenticateToken, authorizeRoles("admin", "formateur", "eleve"), signalPost);
export default router;
